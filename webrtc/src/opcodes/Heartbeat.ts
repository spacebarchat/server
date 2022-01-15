import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { setHeartbeat } from "./../util";
import { Server } from "../Server"

export async function onHeartbeat(this: Server, socket: WebSocket, data: Payload) {
	await setHeartbeat(socket);
}