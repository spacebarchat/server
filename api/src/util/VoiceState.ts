import { Channel, ChannelType, DiscordApiErrors, emitEvent, getPermission, VoiceState, VoiceStateUpdateEvent } from "@fosscord/util";
import { VoiceStateUpdateSchema } from "../schema";


//TODO need more testing when community guild and voice stage channel are working
export async function updateVoiceState(vsuSchema: VoiceStateUpdateSchema, guildId: string, userId: string, targetUserId?: string) {
	const perms = await getPermission(userId, guildId, vsuSchema.channel_id);

	/*
	From https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state
	You must have the MUTE_MEMBERS permission to unsuppress yourself. You can always suppress yourself.
	You must have the REQUEST_TO_SPEAK permission to request to speak. You can always clear your own request to speak.
	 */
	if (targetUserId !== undefined || (vsuSchema.suppress !== undefined && !vsuSchema.suppress)) {
		perms.hasThrow("MUTE_MEMBERS");
	}
	if (vsuSchema.request_to_speak_timestamp !== undefined && vsuSchema.request_to_speak_timestamp !== "") {
		perms.hasThrow("REQUEST_TO_SPEAK")
	}

	if (!targetUserId) {
		targetUserId = userId;
	} else {
		if (vsuSchema.suppress !== undefined && vsuSchema.suppress)
			vsuSchema.request_to_speak_timestamp = "" //Need to check if empty string is the right value
	}

	//TODO assumed that empty string means clean, need to test if it's right
	let voiceState
	try {
		voiceState = await VoiceState.findOneOrFail({
			guild_id: guildId,
			channel_id: vsuSchema.channel_id,
			user_id: targetUserId
		});
	} catch (error) {
		throw DiscordApiErrors.UNKNOWN_VOICE_STATE;
	}

	voiceState.assign(vsuSchema);
	const channel = await Channel.findOneOrFail({ guild_id: guildId, id: vsuSchema.channel_id })
	if (channel.type !== ChannelType.GUILD_STAGE_VOICE) {
		throw DiscordApiErrors.CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE;
	}

	await Promise.all([
		voiceState.save(),
		emitEvent({
			event: "VOICE_STATE_UPDATE",
			data: voiceState,
			guild_id: guildId
		} as VoiceStateUpdateEvent)]);
	return;
}