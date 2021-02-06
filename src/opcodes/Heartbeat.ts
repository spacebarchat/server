import { Payload } from "../util/Constants";
import { Send } from "../util/Send";
import { setHeartbeat } from "../util/setHeartbeat";
import WebSocket from "../util/WebSocket";

export function onHeartbeat(this: WebSocket, data: Payload) {
	setHeartbeat(this);

	Send(this, { op: 11 });
}
