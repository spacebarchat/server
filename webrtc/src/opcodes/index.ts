import { WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "@fosscord/util";

export interface Payload {
	op: number;
	d: any;
	s: number;
	t: string;
}

import { onIdentify } from "./Identify";
import { onSelectProtocol } from "./SelectProtocol";
import { onHeartbeat } from "./Heartbeat";
import { onSpeaking } from "./Speaking";
import { onResume } from "./Resume";
import { onConnect } from "./Connect";

import { onVersion } from "./Version";

export type OPCodeHandler = (this: WebSocket, data: Payload) => any;

export default {
	[VoiceOPCodes.IDENTIFY]: onIdentify,				//op 0
	[VoiceOPCodes.SELECT_PROTOCOL]: onSelectProtocol,	//op 1
	//op 2 voice_ready
	[VoiceOPCodes.HEARTBEAT]: onHeartbeat,				//op 3
	//op 4 session_description
	[VoiceOPCodes.SPEAKING]: onSpeaking,				//op 5
	//op 6 heartbeat_ack 
	[VoiceOPCodes.RESUME]: onResume,					//op 7
	//op 8 hello
	//op 9 resumed
	//op 10?
	//op 11?
	[VoiceOPCodes.CLIENT_CONNECT]: onConnect,			//op 12
	//op 13?
	//op 15?
	//op 16? empty data on client send but server sends {"voice":"0.8.24+bugfix.voice.streams.opt.branch-ffcefaff7","rtc_worker":"0.3.14-crypto-collision-copy"}
	[VoiceOPCodes.VERSION]: onVersion,
};