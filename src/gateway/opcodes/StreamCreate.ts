import { Payload, WebSocket } from "@spacebar/gateway";
import { Config, emitEvent, Region, VoiceState } from "@spacebar/util";

interface StreamCreateSchema {
	type: "guild" | "call";
	channel_id: string;
	guild_id?: string;
	preferred_region?: string;
}

export async function onStreamCreate(this: WebSocket, data: Payload) {
	const body = data.d as StreamCreateSchema;

	// first check if we are in a voice channel already. cannot create a stream if there's no existing voice connection
	if (!this.voiceWs || !this.voiceWs.webrtcConnected) return;

	// TODO: permissions check - if it's a guild, check if user is allowed to create stream in this guild

	// TODO: create a new entry in db (StreamState?) containing the token for authenticating user in stream gateway IDENTIFY

	// TODO: actually apply preferred_region from the event payload
	const regions = Config.get().regions;
	const guildRegion = regions.available.filter(
		(r) => r.id === regions.default,
	)[0];

	const streamKey = `${body.type}${body.type === "guild" ? ":" + body.guild_id : ""}:${body.channel_id}:${this.user_id}`;

	await emitEvent({
		event: "STREAM_CREATE",
		data: {
			stream_key: streamKey,
			rtc_server_id: "lol", // for voice connections in guilds it is guild_id, for dm voice calls it seems to be DM channel id, for GoLive streams a generated number
		},
		guild_id: body.guild_id,
		//user_id: this.user_id,
	});

	await emitEvent({
		event: "STREAM_SERVER_UPDATE",
		data: {
			token: "TEST",
			stream_key: streamKey,
			endpoint: guildRegion.endpoint,
		},
		user_id: this.user_id,
	});
}

//stream key:
// guild:${guild_id}:${channel_id}:${user_id}
// call:${channel_id}:${user_id}
