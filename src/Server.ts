import { db } from "discord-server-util";
import { Server as WebSocketServer } from "ws";
import { Connection } from "./events/Connection";

export class Server {
	public ws: WebSocketServer;
	constructor() {
		this.ws = new WebSocketServer({ port: 8080, maxPayload: 4096 });
		this.ws.on("connection", Connection);
	}

	async listen(): Promise<void> {
		await db.init();
		console.log("listening");
	}
}
