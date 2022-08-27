import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";

export async function onBackendVersion(this: WebSocket, data: Payload) {
	await Send(this, { op: VoiceOPCodes.VOICE_BACKEND_VERSION, d: { voice: "0.8.43", rtc_worker: "0.3.26" } });
}
