import { parseStreamKey, Payload, WebSocket } from "@spacebar/gateway";
import {
	emitEvent,
	Stream,
	StreamDeleteEvent,
	StreamDeleteSchema,
	VoiceState,
	VoiceStateUpdateEvent,
} from "@spacebar/util";
import { check } from "./instanceOf";

export async function onStreamDelete(this: WebSocket, data: Payload) {
	check.call(this, StreamDeleteSchema, data.d);
	const body = data.d as StreamDeleteSchema;

	let parsedKey: {
		type: "guild" | "call";
		channelId: string;
		guildId?: string;
		userId: string;
	};

	try {
		parsedKey = parseStreamKey(body.stream_key);
	} catch (e) {
		return this.close(4000, "Invalid stream key");
	}

	const { userId, channelId, guildId, type } = parsedKey;

	// when a user selects to stop watching another user stream, this event gets triggered
	// just disconnect user without actually deleting stream
	if (this.user_id !== userId) {
		await emitEvent({
			event: "STREAM_DELETE",
			data: {
				stream_key: body.stream_key,
			},
			user_id: this.user_id,
		} as StreamDeleteEvent);
		return;
	}

	const stream = await Stream.findOne({
		where: { channel_id: channelId, owner_id: userId },
	});

	if (!stream) return;

	await stream.remove();

	const voiceState = await VoiceState.findOne({
		where: { user_id: this.user_id },
	});

	if (voiceState) {
		voiceState.self_stream = false;
		await voiceState.save();

		await emitEvent({
			event: "VOICE_STATE_UPDATE",
			data: { ...voiceState },
			guild_id: guildId,
			channel_id: channelId,
		} as VoiceStateUpdateEvent);
	}

	await emitEvent({
		event: "STREAM_DELETE",
		data: {
			stream_key: body.stream_key,
		},
		guild_id: guildId,
		channel_id: channelId,
	} as StreamDeleteEvent);
}
