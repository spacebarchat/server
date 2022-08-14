import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util";

// {"speaking":1,"delay":5,"ssrc":2805246727}

export async function onSpeaking(this: WebSocket, data: Payload) {}
