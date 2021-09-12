import { CLOSECODES, Payload } from "@fosscord/gateway/util/Constants";
import { Send } from "@fosscord/gateway/util/Send";
import { setHeartbeat } from "@fosscord/gateway/util/setHeartbeat";
import WebSocket from "@fosscord/gateway/util/WebSocket";

export async function onHeartbeat(this: WebSocket, data: Payload) {
	// TODO: validate payload

	setHeartbeat(this);

	await Send(this, { op: 11 });
}
