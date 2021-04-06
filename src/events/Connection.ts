import WebSocket, { Server } from "../util/WebSocket";
import { IncomingMessage } from "http";
import { Close } from "./Close";
import { Message } from "./Message";
import { setHeartbeat } from "../util/setHeartbeat";
import { Send } from "../util/Send";
import { CLOSECODES, OPCODES } from "../util/Constants";
import { createDeflate } from "zlib";

// TODO: check rate limit
// TODO: specify rate limit in config

export async function Connection(this: Server, socket: WebSocket, request: IncomingMessage) {
	try {
		socket.on("close", Close);
		socket.on("message", Message);

		const { searchParams } = new URL(`http://localhost${request.url}`);
		// @ts-ignore
		socket.encoding = searchParams.get("encoding") || "json";
		if (!["json", "etf"].includes(socket.encoding)) return socket.close(CLOSECODES.Decode_error);

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
