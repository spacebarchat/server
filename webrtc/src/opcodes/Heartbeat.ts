import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { setHeartbeat } from "./../util";

export async function onHeartbeat(socket: WebSocket, data: Payload) {
	await setHeartbeat(socket);
}