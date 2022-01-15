import { Server as WebSocketServer } from "ws";
import { WebSocket, CLOSECODES, Payload, OPCODES } from "@fosscord/gateway";
import { Config, initDatabase } from "@fosscord/util";
import OPCodeHandlers from "./opcodes";
import { setHeartbeat } from "./util"
import mediasoup from "mediasoup";

var port = Number(process.env.PORT);
if (isNaN(port)) port = 3004;

export class Server {
	public ws: WebSocketServer;

	constructor() {
		this.ws = new WebSocketServer({
			port,
			maxPayload: 4096,
		});
		this.ws.on("connection", async (socket: WebSocket) => {
			await setHeartbeat(socket);

			socket.on("message", async (message: string) => {
				const payload: Payload = JSON.parse(message);

				if (OPCodeHandlers[payload.op])
					await OPCodeHandlers[payload.op](socket, payload);
				else
					console.error(`Unimplemented`, payload)
			});
		});
	}

	async listen(): Promise<void> {
		// @ts-ignore
		await initDatabase();
		await Config.init();
		console.log("[DB] connected");
		console.log(`[WebRTC] online on 0.0.0.0:${port}`);
	}
}
