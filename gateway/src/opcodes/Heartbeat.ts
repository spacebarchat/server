import { CLOSECODES, Payload } from "../util/Constants";
import { Send } from "../util/Send";
import { setHeartbeat } from "../util/setHeartbeat";
import WebSocket from "../util/WebSocket";

export async function onHeartbeat(this: WebSocket, data: Payload) {
	// TODO: validate payload

	setHeartbeat(this);

	await Send(this, { op: 11 });
}
