import { Payload, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";
import { onBackendVersion } from "./BackendVersion";
import { onHeartbeat } from "./Heartbeat";
import { onIdentify } from "./Identify";
import { onSelectProtocol } from "./SelectProtocol";
import { onSpeaking } from "./Speaking";
import { onVideo } from "./Video";

export type OPCodeHandler = (this: WebSocket, data: Payload) => any;

export default {
	[VoiceOPCodes.HEARTBEAT]: onHeartbeat,
	[VoiceOPCodes.IDENTIFY]: onIdentify,
	[VoiceOPCodes.VOICE_BACKEND_VERSION]: onBackendVersion,
	[VoiceOPCodes.VIDEO]: onVideo,
	[VoiceOPCodes.SPEAKING]: onSpeaking,
	[VoiceOPCodes.SELECT_PROTOCOL]: onSelectProtocol
};