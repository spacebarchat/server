import "missing-native-js-functions";
import dotenv from "dotenv";
dotenv.config();
import { db } from "@fosscord/server-util";
import { Server as WebSocketServer } from "ws";
import { Connection } from "./events/Connection";
import Config from "./util/Config";

// TODO: only listen/start the server if everything got initalized
// https://www.npmjs.com/package/ws use "External HTTP/S server" and listen manually at the end of listen()

var port = Number(process.env.PORT);
if (isNaN(port)) port = 3002;

export class Server {
	public ws: WebSocketServer;
	constructor() {
		this.ws = new WebSocketServer({
			port,

			maxPayload: 4096,
			// perMessageDeflate: {
			// 	zlibDeflateOptions: {
			// 		chunkSize: 65536,
			// 	},
			// },
		});
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
		console.log("[DB] connected");
		await Config.init();
		console.log(`[Gateway] online on 0.0.0.0:${port}`);
	}
}
