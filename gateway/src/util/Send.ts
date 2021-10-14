var erlpack: any;
try {
	erlpack = require("@yukikaze-bot/erlpack");
} catch (error) {}
import { Payload, WebSocket } from "@fosscord/gateway";

export async function Send(socket: WebSocket, data: Payload) {
	let buffer: Buffer | string;
	if (socket.encoding === "etf") buffer = erlpack.pack(data);
	// TODO: encode circular object
	else if (socket.encoding === "json") buffer = JSON.stringify(data);
	else return;
	// TODO: compression
	if (socket.deflate) {
		socket.deflate.write(buffer);
		socket.deflate.flush();
		return;
	}

	return new Promise((res, rej) => {
		if (socket.readyState !== 1) {
			return rej("socket not open");
		}
		socket.send(buffer, (err: any) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
