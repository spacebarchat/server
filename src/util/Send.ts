import erlpack from "erlpack";
import { promisify } from "util";
import { Payload } from "../util/Constants";

import WebSocket from "./WebSocket";

export async function Send(socket: WebSocket, data: Payload) {
	let buffer: Buffer | string;
	if (socket.encoding === "etf") buffer = erlpack.pack(data);
	// TODO: encode circular object
	else if (socket.encoding === "json") buffer = JSON.stringify(data);

	// TODO: compression

	return new Promise((res, rej) => {
		socket.send(buffer, (err) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
