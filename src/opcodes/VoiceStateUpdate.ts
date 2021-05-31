import { VoiceStateUpdateSchema } from "../schema/VoiceStateUpdate.ts";
import { CLOSECODES, Payload } from "../util/Constants";
import { Send } from "../util/Send";

import WebSocket from "../util/WebSocket";
import { check } from "./instanceOf";
// TODO: implementation
// TODO: check if a voice server is setup
// TODO: save voice servers in database and retrieve them
// Notice: Bot users respect the voice channel's user limit, if set. When the voice channel is full, you will not receive the Voice State Update or Voice Server Update events in response to your own Voice State Update. Having MANAGE_CHANNELS permission bypasses this limit and allows you to join regardless of the channel being full or not.

export async function onVoiceStateUpdate(this: WebSocket, data: Payload) {
	check.call(this, VoiceStateUpdateSchema, data.d);
	const body = data.d as VoiceStateUpdateSchema;

	await Send(this, {
		op: 0,
		s: this.sequence++,
		t: "VOICE_SERVER_UPDATE",
		d: {
			token: ``,
			guild_id: body.guild_id,
			endpoint: `localhost:3004`,
		},
	});
}
