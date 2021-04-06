import erlpack from "erlpack";
import { promisify } from "util";
import { Payload } from "../util/Constants";
import { deflateSync } from "zlib";

import WebSocket from "./WebSocket";

export async function Send(socket: WebSocket, data: Payload) {
	let buffer: Buffer | string;
	if (socket.encoding === "etf") buffer = erlpack.pack(data);
	// TODO: encode circular object
	else if (socket.encoding === "json") buffer = JSON.stringify(data);

	// TODO: compression
	if (socket.deflate) {
		socket.deflate.write(buffer);
		socket.deflate.flush();
		return;
	}

	return new Promise((res, rej) => {
		socket.send(buffer, (err) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
