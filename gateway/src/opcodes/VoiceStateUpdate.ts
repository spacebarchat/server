import { VoiceStateUpdateSchema } from "../schema/VoiceStateUpdateSchema";
import { Payload, WebSocket } from "@fosscord/gateway";
import { genVoiceToken } from "../util/SessionUtils";
import { check } from "./instanceOf";
import {
	Config,
	emitEvent,
	Guild,
	Member,
	Region,
	VoiceServerUpdateEvent,
	VoiceState,
	VoiceStateUpdateEvent,
} from "@fosscord/util";
// TODO: check if a voice server is setup
// Notice: Bot users respect the voice channel's user limit, if set. When the voice channel is full, you will not receive the Voice State Update or Voice Server Update events in response to your own Voice State Update. Having MANAGE_CHANNELS permission bypasses this limit and allows you to join regardless of the channel being full or not.

export async function onVoiceStateUpdate(this: WebSocket, data: Payload) {
	check.call(this, VoiceStateUpdateSchema, data.d);
	const body = data.d as VoiceStateUpdateSchema;

	let voiceState: VoiceState;
	try {
		voiceState = await VoiceState.findOneOrFail({
			where: { user_id: this.user_id },
		});
		if (
			voiceState.session_id !== this.session_id &&
			body.channel_id === null
		) {
			//Should we also check guild_id === null?
			//changing deaf or mute on a client that's not the one with the same session of the voicestate in the database should be ignored
			return;
		}

		//If a user change voice channel between guild we should send a left event first
		if (
			voiceState.guild_id !== body.guild_id &&
			voiceState.session_id === this.session_id
		) {
			await emitEvent({
				event: "VOICE_STATE_UPDATE",
				data: { ...voiceState, channel_id: null },
				guild_id: voiceState.guild_id,
			});
		}

		//The event send by Discord's client on channel leave has both guild_id and channel_id as null
		if (body.guild_id === null) body.guild_id = voiceState.guild_id;
		voiceState.assign(body);
	} catch (error) {
		voiceState = new VoiceState({
			...body,
			user_id: this.user_id,
			deaf: false,
			mute: false,
			suppress: false,
		});
	}

	//TODO the member should only have these properties: hoisted_role, deaf, joined_at, mute, roles, user
	//TODO the member.user should only have these properties: avatar, discriminator, id, username
	//TODO this may fail
	voiceState.member = await Member.findOneOrFail({
		where: { id: voiceState.user_id, guild_id: voiceState.guild_id },
		relations: ["user", "roles"],
	});

	//If the session changed we generate a new token
	if (voiceState.session_id !== this.session_id)
		voiceState.token = genVoiceToken();
	voiceState.session_id = this.session_id;

	const { id, ...newObj } = voiceState;

	await Promise.all([
		voiceState.save(),
		emitEvent({
			event: "VOICE_STATE_UPDATE",
			data: newObj,
			guild_id: voiceState.guild_id,
		} as VoiceStateUpdateEvent),
	]);

	//If it's null it means that we are leaving the channel and this event is not needed
	if (voiceState.channel_id !== null) {
		const guild = await Guild.findOne({ id: voiceState.guild_id });
		const regions = Config.get().regions;
		let guildRegion: Region;
		if (guild && guild.region) {
			guildRegion = regions.available.filter(
				(r) => r.id === guild.region
			)[0];
		} else {
			guildRegion = regions.available.filter(
				(r) => r.id === regions.default
			)[0];
		}

		await emitEvent({
			event: "VOICE_SERVER_UPDATE",
			data: {
				token: voiceState.token,
				guild_id: voiceState.guild_id,
				endpoint: guildRegion.endpoint,
			},
			guild_id: voiceState.guild_id,
		} as VoiceServerUpdateEvent);
	}
}
