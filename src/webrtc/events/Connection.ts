import { CLOSECODES, Send, setHeartbeat, WebSocket } from "@fosscord/gateway";
import { IncomingMessage } from "http";
import { URL } from "url";
import WS from "ws";
import { VoiceOPCodes } from "../util";
import { onClose } from "./Close";
import { onMessage } from "./Message";
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
