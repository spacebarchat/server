import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { setHeartbeat } from "../util";
import { Server } from "../Server"

export async function onVersion(this: Server, socket: WebSocket, data: Payload) {
	socket.send(JSON.stringify({
		op: 16,
		d: {
			voice: "0.8.31",	//version numbers?
			rtc_worker: "0.3.18",
		}
	}))
}