import { WebSocket, Payload, OPCODES } from "@fosscord/webrtc";
import { onHeartbeat } from "./Heartbeat";

export type OPCodeHandler = (this: WebSocket, data: Payload) => any;

export default {
	[OPCODES.Heartbeat]: onHeartbeat
};
