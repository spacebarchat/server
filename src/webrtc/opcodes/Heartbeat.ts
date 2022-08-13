import {
	CLOSECODES,
	OPCODES,
	Payload,
	Send,
	setHeartbeat,
	WebSocket,
} from "@fosscord/webrtc";

export async function onHeartbeat(this: WebSocket, data: Payload) {
	setHeartbeat(this);
	if (isNaN(data.d)) return this.close(CLOSECODES.Decode_error);

	await Send(this, { op: OPCODES.Heartbeat_Acknowledge, d: data.d });
}
