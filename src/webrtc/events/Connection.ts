import WS from "ws";
import {
	CLOSECODES,
	OPCODES,
	Send,
	setHeartbeat,
	WebSocket,
} from "@fosscord/webrtc";
import { IncomingMessage } from "http";
import { Close } from "./Close";
import { Message } from "./Message";
import { createDeflate } from "zlib";
import { URL } from "url";
import { Session } from "@fosscord/util";
var erlpack: any;
try {
	erlpack = require("@yukikaze-bot/erlpack");
} catch (error) {}

// TODO: check rate limit
// TODO: specify rate limit in config
// TODO: check msg max size

export async function Connection(
	this: WS.Server,
	socket: WebSocket,
	request: IncomingMessage
) {
	try {
		// @ts-ignore
		socket.on("close", Close); // @ts-ignore
		socket.on("message", Message);

		const { searchParams } = new URL(`http://localhost${request.url}`);

		socket.version = Number(searchParams.get("version")) || 5;
		if (socket.version < 3) return socket.close(CLOSECODES.Unkown_Protocol);

		setHeartbeat(socket);

		await Send(socket, {
			op: OPCODES.Hello,
			d: {
				heartbeat_interval: 1000 * 30,
			},
		});

		socket.readyTimeout = setTimeout(() => {
			return socket.close(CLOSECODES.Session_Timeout);
		}, 1000 * 30);
	} catch (error) {
		console.error(error);
		return socket.close(CLOSECODES.Unknown_error);
	}
}
