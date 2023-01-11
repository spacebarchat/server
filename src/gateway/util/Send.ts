var erlpack: any;
try {
	erlpack = require("@yukikaze-bot/erlpack");
} catch (error) {
	console.log(
		"Missing @yukikaze-bot/erlpack, electron-based desktop clients designed for discord.com will not be able to connect!",
	);
}
import { Payload, WebSocket } from "@fosscord/gateway";
import fs from "fs";
import path from "path";

export function Send(socket: WebSocket, data: Payload) {
	if (process.env.WS_VERBOSE) console.log(`[Websocket] Outgoing message: ${JSON.stringify(data)}`);
	if (process.env.WS_DUMP) {
		if(socket.session_id) {
			fs.mkdirSync(path.join("dump", socket.session_id), { recursive: true });
			fs.writeFileSync(path.join("dump", socket.session_id, `${Date.now()}.out.json`), JSON.stringify(data, null, 2));
		}
		else {
			fs.mkdirSync(path.join("dump", "unknown"), { recursive: true });
			fs.writeFileSync(path.join("dump", "unknown", `${Date.now()}.out.json`), JSON.stringify(data, null, 2));
			console.log("Unknown session ID, dumping to unknown folder!");
		}
		
	}
	let buffer: Buffer | string;
	if (socket.encoding === "etf") buffer = erlpack.pack(data);
	// TODO: encode circular object
	else if (socket.encoding === "json") buffer = JSON.stringify(data);
	else return;
	// TODO: compression
	if (socket.deflate) {
		buffer = socket.deflate.process(buffer) as Buffer;
	}

	return new Promise((res, rej) => {
		if (socket.readyState !== 1) {
			// return rej("socket not open");
			socket.close();
			return;
		}

		socket.send(buffer, (err: any) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
