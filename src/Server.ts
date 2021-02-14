import { db } from "fosscord-server-util";
import { Server as WebSocketServer } from "ws";
import { Connection } from "./events/Connection";
import Config from "./util/Config";

export class Server {
	public ws: WebSocketServer;
	constructor() {
		this.ws = new WebSocketServer({ port: 8080, maxPayload: 4096 });
		this.ws.on("connection", Connection);
	}

	async setupSchema() {
		// TODO: adjust expireAfterSeconds -> lower
		await db.collection("events").createIndex({ created_at: 1 }, { expireAfterSeconds: 60 });
	}

	async listen(): Promise<void> {
		// @ts-ignore
		await (db as Promise<Connection>);
		await this.setupSchema();
		await Config.init();
		console.log("listening");
	}
}
