import { Payload, WebSocket } from "@fosscord/gateway";
import { genVoiceToken } from "../util/SessionUtils";
import { check } from "./instanceOf";
import {
	Config,
	emitEvent,
	Guild,
	Member,
	VoiceServerUpdateEvent,
	VoiceState,
	VoiceStateUpdateEvent,
	VoiceStateUpdateSchema
} from "@fosscord/util";
import { OrmUtils } from "@fosscord/util";
import { Region } from "@fosscord/util";
// TODO: check if a voice server is setup
// Notice: Bot users respect the voice channel's user limit, if set. When the voice channel is full, you will not receive the Voice State Update or Voice Server Update events in response to your own Voice State Update. Having MANAGE_CHANNELS permission bypasses this limit and allows you to join regardless of the channel being full or not.

export async function onVoiceStateUpdate(this: WebSocket, data: Payload) {
	check.call(this, VoiceStateUpdateSchema, data.d);
	const body = data.d as VoiceStateUpdateSchema;

	let onlySettingsChanged = false;
	let voiceState: VoiceState;
	try {
		voiceState = await VoiceState.findOneOrFail({
			where: { user_id: this.user_id }
		});
		if (voiceState.session_id !== this.session_id) {
			// new session
		} else {
			if (voiceState.channel_id === body.channel_id) onlySettingsChanged = true;
		}

		//If a user change voice channel between guild we should send a left event first
		if (voiceState.guild_id !== body.guild_id && voiceState.session_id === this.session_id) {
			await emitEvent({
				event: "VOICE_STATE_UPDATE",
				data: { ...voiceState, channel_id: null },
				guild_id: voiceState.guild_id
			});
		}

		//The event send by Discord's client on channel leave has both guild_id and channel_id as null
		if (body.guild_id === null) body.guild_id = voiceState.guild_id;
		voiceState = OrmUtils.mergeDeep(voiceState, body);
	} catch (error) {
		voiceState = OrmUtils.mergeDeep(new VoiceState(), {
			...body,
			user_id: this.user_id,
			deaf: false,
			mute: false,
			suppress: false
		});
	}

	//TODO the member should only have these properties: hoisted_role, deaf, joined_at, mute, roles, user
	//TODO the member.user should only have these properties: avatar, discriminator, id, username
	//TODO this may fail
	voiceState.member = await Member.findOneOrFail({
		where: { id: voiceState.user_id, guild_id: voiceState.guild_id },
		relations: ["user", "roles"]
	});

	//If the session changed we generate a new token
	if (voiceState.session_id !== this.session_id) voiceState.token = genVoiceToken();
	voiceState.session_id = this.session_id;

	const { id, token, ...newObj } = voiceState;

	await Promise.all([
		voiceState.save(),
		emitEvent({
			event: "VOICE_STATE_UPDATE",
			data: newObj,
			guild_id: voiceState.guild_id
		} as VoiceStateUpdateEvent)
	]);

	//If it's null it means that we are leaving the channel and this event is not needed
	if (voiceState.channel_id !== null && !onlySettingsChanged) {
		const guild = await Guild.findOne({ where: { id: voiceState.guild_id } });
		const regions = Config.get().regions;
		let guildRegion: Region;
		if (guild && guild.region) {
			guildRegion = regions.available.filter((r) => r.id === guild.region)[0];
		} else {
			guildRegion = regions.available.filter((r) => r.id === regions.default)[0];
		}

		await emitEvent({
			event: "VOICE_SERVER_UPDATE",
			data: {
				token: token,
				guild_id: voiceState.guild_id,
				endpoint: guildRegion.endpoint ? guildRegion.endpoint + "/voice" : `localhost:${process.env.PORT || 3001}/voice`
			},
			user_id: this.user_id
		} as VoiceServerUpdateEvent);
	}
}
