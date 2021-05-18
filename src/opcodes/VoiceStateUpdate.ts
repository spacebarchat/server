import { VoiceStateUpdateSchema } from "../schema/VoiceStateUpdate.ts";
import { CLOSECODES, Payload } from "../util/Constants";

import WebSocket from "../util/WebSocket";
import { check } from "./instanceOf";
// TODO: implementation
// TODO: check if a voice server is setup
// TODO: save voice servers in database and retrieve them
// Notice: Bot users respect the voice channel's user limit, if set. When the voice channel is full, you will not receive the Voice State Update or Voice Server Update events in response to your own Voice State Update. Having MANAGE_CHANNELS permission bypasses this limit and allows you to join regardless of the channel being full or not.

export function onVoiceStateUpdate(this: WebSocket, data: Payload) {
	check.call(this, VoiceStateUpdateSchema, data.d);
}
