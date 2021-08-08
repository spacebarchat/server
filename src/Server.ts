import "missing-native-js-functions";
import dotenv from "dotenv";
dotenv.config();
import { Config, db } from "@fosscord/server-util";
import { Server as WebSocketServer } from "ws";
import { Connection } from "./events/Connection";
import http from "http";

export class Server {
	public ws: WebSocketServer;
	public port: number;
	public server: http.Server;
	public production: boolean;

	constructor({ port, server, production }: { port: number; server?: http.Server; production?: boolean }) {
		this.port = port;
		this.production = production || false;

		if (server) this.server = server;
		else
			this.server = http.createServer(function (req, res) {
				res.writeHead(200).end("Online");
			});

		this.ws = new WebSocketServer({
			maxPayload: 4096,
			server: this.server,
		});
		this.ws.on("connection", Connection);
		this.ws.on("error", console.error);
	}

	async setupSchema() {
		// TODO: adjust expireAfterSeconds -> lower
		await Promise.all([db.collection("events").createIndex({ created_at: 1 }, { expireAfterSeconds: 60 })]);
	}

	async start(): Promise<void> {
		// @ts-ignore
		await (db as Promise<Connection>);
		await this.setupSchema();
		await Config.init();
		console.log("[Database] connected");
		if (!this.server.listening) {
			this.server.listen(this.port);
			console.log(`[Gateway] online on 0.0.0.0:${this.port}`);
		}
	}

	async stop() {
		await db.close();
		this.server.close();
	}
}
