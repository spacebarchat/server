import { Payload } from "../util/Constants";
import WebSocket from "../util/WebSocket";
import { onHeartbeat } from "./Heartbeat";
import { onIdentify } from "./Identify";
import { onPresenceUpdate } from "./PresenceUpdate";
import { onRequestGuildMembers } from "./RequestGuildMembers";
import { onResume } from "./Resume";
import { onVoiceStateUpdate } from "./VoiceStateUpdate";

export type OPCodeHandler = (this: WebSocket, data: Payload) => any;

export default {
	1: onHeartbeat,
	2: onIdentify,
	3: onPresenceUpdate,
	4: onVoiceStateUpdate,
	5: onResume,
	8: onRequestGuildMembers,
};
