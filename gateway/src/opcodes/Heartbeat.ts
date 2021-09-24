import { Payload, Send, setHeartbeat, WebSocket } from "@fosscord/gateway";

export async function onHeartbeat(this: WebSocket, data: Payload) {
	// TODO: validate payload

	setHeartbeat(this);

	await Send(this, { op: 11 });
}
