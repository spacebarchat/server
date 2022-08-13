import { Intents, Permissions } from "@fosscord/util";
import WS from "ws";
import { Deflate } from "zlib";
import { Payload } from "./Constants";

export interface WebSocket extends WS {
	version: number;
	user_id?: string;
	session_id?: string;
	heartbeatTimeout: NodeJS.Timeout;
	readyTimeout: NodeJS.Timeout;
}

export async function Send(socket: WebSocket, data: Payload) {
	return new Promise((res, rej) => {
		socket.send(JSON.stringify(data), (err: any) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
