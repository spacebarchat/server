import { CloseCodes, Payload, Send, setHeartbeat, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";

export async function onHeartbeat(this: WebSocket, data: Payload) {
	setHeartbeat(this);
	if (isNaN(data.d)) return this.close(CloseCodes.Decode_error);

	await Send(this, { op: VoiceOPCodes.HEARTBEAT_ACK, d: data.d });
}
