/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/* eslint-disable @typescript-eslint/ban-ts-comment */
import WS from "ws";
import { genSessionId, WebSocket } from "@spacebar/gateway";
import { Send } from "../util/Send";
import { CLOSECODES, OPCODES } from "../util/Constants";
import { setHeartbeat } from "../util/Heartbeat";
import { IncomingMessage } from "http";
import { Close } from "./Close";
import { Message } from "./Message";
import { Deflate, Inflate } from "fast-zlib";
import { URL } from "url";
import { Config, EnvConfig, ErlpackType } from "@spacebar/util";
import { Decoder, Encoder } from "@toondepauw/node-zstd";

let erlpack: ErlpackType | null = null;
try {
	erlpack = require("@yukikaze-bot/erlpack") as ErlpackType;
} catch (e) {
	console.log("[Gateway] Failed to import @yukikaze-bot/erlpack:", EnvConfig.get().logging.logImportErrors ? e : "is it installed?");
}

// TODO: check rate limit
// TODO: specify rate limit in config
// TODO: check msg max size

export async function Connection(
	this: WS.Server,
	socket: WebSocket,
	request: IncomingMessage,
) {
	const forwardedFor = Config.get().security.forwardedFor;
	const ipAddress = forwardedFor
		? (request.headers[forwardedFor.toLowerCase()] as string)
		: request.socket.remoteAddress;

	socket.ipAddress = ipAddress;
	socket.userAgent = request.headers["user-agent"] as string;
	socket.logUserRef = "[Unauthenticated]";

	if (!ipAddress && Config.get().security.cdnSignatureIncludeIp) {
		return socket.close(
			CLOSECODES.Decode_error,
			"Gateway connection rejected: IP address is required.",
		);
	}

	if (
		!socket.userAgent &&
		Config.get().security.cdnSignatureIncludeUserAgent
	) {
		return socket.close(
			CLOSECODES.Decode_error,
			"Gateway connection rejected: User-Agent header is required.",
		);
	}

	//Create session ID when the connection is opened. This allows gateway dump to group the initial websocket messages with the rest of the conversation.
	const session_id = genSessionId();
	socket.session_id = session_id; //Set the session of the WebSocket object

	try {
		// @ts-ignore
		socket.on("close", Close);
		// @ts-ignore
		socket.on("message", Message);

		socket.on("error", (err) => console.error("[Gateway]", err));

		console.log(
			`[Gateway] New connection from ${ipAddress}, total ${this.clients.size}`,
		);

		if (EnvConfig.get().logging.gatewayLogging.logHttp)
			[
				"close",
				"error",
				"upgrade",
				"open",
				"ping",
				"pong",
				"unexpected-response",
				...(EnvConfig.get().logging.gatewayLogging.logHttpMessages ? ["message"] : []),
			].forEach((x) => {
				socket.on(x, (y) => console.log(x, y));
			});

		const { searchParams } = new URL(`http://localhost${request.url}`);
		// @ts-ignore
		socket.encoding = searchParams.get("encoding") || "json";
		if (!["json", "etf"].includes(socket.encoding))
			return socket.close(CLOSECODES.Decode_error);

		if (socket.encoding === "etf" && !erlpack)
			throw new Error("Erlpack is not installed: 'npm i @yukikaze-bot/erlpack'");

		socket.version = Number(searchParams.get("version")) || 8;
		if (socket.version != 8)
			return socket.close(CLOSECODES.Invalid_API_version);

		// @ts-ignore
		socket.compress = searchParams.get("compress") || "";
		if (socket.compress) {
			if (socket.compress === "zlib-stream") {
				socket.deflate = new Deflate();
				socket.inflate = new Inflate();
			} else if (socket.compress === "zstd-stream") {
				socket.zstdEncoder = new Encoder(6);
				socket.zstdDecoder = new Decoder();
			} else {
				return socket.close(CLOSECODES.Decode_error);
			}
		}

		socket.events = {};
		socket.member_events = {};
		socket.permissions = {};
		socket.sequence = 0;

		setHeartbeat(socket);

		await Send(socket, {
			op: OPCODES.Hello,
			d: {
				heartbeat_interval: 1000 * 30,
			},
		});

		socket.readyTimeout = setTimeout(() => {
			return socket.close(CLOSECODES.Session_timed_out);
		}, 1000 * 30);
	} catch (error) {
		console.error(error);
		return socket.close(CLOSECODES.Unknown_error);
	}
}
