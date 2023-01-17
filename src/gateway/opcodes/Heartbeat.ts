import { WebSocket } from "@fosscord/gateway";
import { setHeartbeat } from "../util/Heartbeat";
import { Send } from "../util/Send";

export async function onHeartbeat(this: WebSocket) {
	// TODO: validate payload

	setHeartbeat(this);

	await Send(this, { op: 11 });
}
