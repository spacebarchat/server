import { Server as WebSocketServer } from "ws";
import { Config, db } from "@fosscord/util";
import mediasoup from "mediasoup";

var port = Number(process.env.PORT);
if (isNaN(port)) port = 3004;

export class Server {
	public ws: WebSocketServer;
	public turn: any;

	constructor() {
		this.ws = new WebSocketServer({
			port,
			maxPayload: 4096,
		});
		this.ws.on("connection", (socket) => {
			socket.on("message", (message) => {
				socket.emit(
					JSON.stringify({
						op: 2,
						d: {
							ssrc: 1,
							ip: "127.0.0.1",
							port: 3004,
							modes: [
								"xsalsa20_poly1305",
								"xsalsa20_poly1305_suffix",
								"xsalsa20_poly1305_lite",
							],
							heartbeat_interval: 1,
						},
					})
				);
			});
		});
	}

	async listen(): Promise<void> {
		// @ts-ignore
		await (db as Promise<Connection>);
		await Config.init();
		console.log("[DB] connected");
		console.log(`[WebRTC] online on 0.0.0.0:${port}`);
	}
}
