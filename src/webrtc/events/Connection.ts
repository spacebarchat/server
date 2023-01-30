/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { CLOSECODES, Send, setHeartbeat, WebSocket } from "@fosscord/gateway";
import { IncomingMessage } from "http";
import { URL } from "url";
import WS from "ws";
import { VoiceOPCodes } from "../util";
import { onClose } from "./Close";
import { onMessage } from "./Message";
import erlpack from "erlpack";

// TODO: check rate limit
// TODO: specify rate limit in config
// TODO: check msg max size

export async function Connection(
	this: WS.Server,
	socket: WebSocket,
	request: IncomingMessage,
) {
	try {
		socket.on("close", onClose.bind(socket));
		socket.on("message", onMessage.bind(socket));
		console.log("[WebRTC] new connection", request.url);

		if (process.env.WS_LOGEVENTS) {
			[
				"close",
				"error",
				"upgrade",
				//"message",
				"open",
				"ping",
				"pong",
				"unexpected-response",
			].forEach((x) => {
				socket.on(x, (y) => console.log("[WebRTC]", x, y));
			});
		}

		const { searchParams } = new URL(`http://localhost${request.url}`);

		socket.encoding = "json";
		socket.version = Number(searchParams.get("v")) || 5;
		if (socket.version < 3)
			return socket.close(CLOSECODES.Unknown_error, "invalid version");

		setHeartbeat(socket);

		socket.readyTimeout = setTimeout(() => {
			return socket.close(CLOSECODES.Session_timed_out);
		}, 1000 * 30);

		await Send(socket, {
			op: VoiceOPCodes.HELLO,
			d: {
				heartbeat_interval: 1000 * 30,
			},
		});
	} catch (error) {
		console.error("[WebRTC]", error);
		return socket.close(CLOSECODES.Unknown_error);
	}
}
