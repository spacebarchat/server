import { WebSocket } from "@fosscord/gateway";
import { IncomingMessage } from "http";
import { URL } from "url";
import WS from "ws";
import { createDeflate } from "zlib";
import { CLOSECODES, OPCODES } from "../util/Constants";
import { setHeartbeat } from "../util/Heartbeat";
import { Send } from "../util/Send";
import { Close } from "./Close";
import { Message } from "./Message";
let erlpack: any;
try {
	erlpack = require("@yukikaze-bot/erlpack");
} catch (error) {}

// TODO: check rate limit
// TODO: specify rate limit in config
// TODO: check msg max size

export async function Connection(this: WS.Server, socket: WebSocket, request: IncomingMessage) {
	try {
		// @ts-ignore
		socket.on("close", Close);
		// @ts-ignore
		socket.on("message", Message);

		if (process.env.WS_LOGEVENTS)
			[
				"close",
				"error",
				"upgrade",
				//"message",
				"open",
				"ping",
				"pong",
				"unexpected-response"
			].forEach((x) => {
				socket.on(x, (y) => console.log(x, y));
			});

		console.log(`[Gateway] Connections: ${this.clients.size}`);

		const { searchParams } = new URL(`http://localhost${request.url}`);
		// @ts-ignore
		socket.encoding = searchParams.get("encoding") || "json";
		if (!["json", "etf"].includes(socket.encoding)) {
			if (socket.encoding === "etf" && erlpack) {
				throw new Error("Erlpack is not installed: 'npm i @yukikaze-bot/erlpack'");
			}
			return socket.close(CLOSECODES.Decode_error);
		}

		// @ts-ignore
		socket.version = Number(searchParams.get("version")) || 8;
		if (socket.version != 8) return socket.close(CLOSECODES.Invalid_API_version);

		// @ts-ignore
		socket.compress = searchParams.get("compress") || "";
		if (socket.compress) {
			if (socket.compress !== "zlib-stream") return socket.close(CLOSECODES.Decode_error);
			socket.deflate = createDeflate({ chunkSize: 65535 });
			socket.deflate.on("data", (chunk) => socket.send(chunk));
		}

		socket.events = {};
		socket.member_events = {};
		socket.permissions = {};
		socket.sequence = 0;

		setHeartbeat(socket);

		await Send(socket, {
			op: OPCODES.Hello,
			d: {
				heartbeat_interval: 1000 * 30
			}
		});

		socket.readyTimeout = setTimeout(() => {
			return socket.close(CLOSECODES.Session_timed_out);
		}, 1000 * 30);
	} catch (error) {
		console.error(error);
		return socket.close(CLOSECODES.Unknown_error);
	}
}
