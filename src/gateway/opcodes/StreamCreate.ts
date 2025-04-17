import {
	genVoiceToken,
	Payload,
	WebSocket,
	generateStreamKey,
} from "@spacebar/gateway";
import {
	Channel,
	Config,
	emitEvent,
	Region,
	Snowflake,
	Stream,
	StreamCreateSchema,
	StreamSession,
} from "@spacebar/util";
import { check } from "./instanceOf";

export async function onStreamCreate(this: WebSocket, data: Payload) {
	check.call(this, StreamCreateSchema, data.d);
	const body = data.d as StreamCreateSchema;

	// TODO: first check if we are in a voice channel already. cannot create a stream if there's no existing voice connection
	if (body.channel_id.trim().length === 0) return;

	// TODO: permissions check - if it's a guild, check if user is allowed to create stream in this guild

	const channel = await Channel.findOne({
		where: { id: body.channel_id },
	});

	if (
		!channel ||
		(body.type === "guild" && channel.guild_id != body.guild_id)
	)
		return this.close(4000, "invalid channel");

	// TODO: actually apply preferred_region from the event payload
	const regions = Config.get().regions;
	const guildRegion = regions.available.filter(
		(r) => r.id === regions.default,
	)[0];

	// create a new entry in db containing the token for authenticating user in stream gateway IDENTIFY
	const stream = Stream.create({
		id: Snowflake.generate(),
		owner_id: this.user_id,
		channel_id: body.channel_id,
		endpoint: guildRegion.endpoint,
	});

	await stream.save();

	const token = genVoiceToken();

	const streamSession = StreamSession.create({
		stream_id: stream.id,
		user_id: this.user_id,
		session_id: this.session_id,
		token,
	});

	await streamSession.save();

	const streamKey = generateStreamKey(
		body.type,
		body.guild_id,
		body.channel_id,
		this.user_id,
	);

	await emitEvent({
		event: "STREAM_CREATE",
		data: {
			stream_key: streamKey,
			rtc_server_id: stream.id, // for voice connections in guilds it is guild_id, for dm voice calls it seems to be DM channel id, for GoLive streams a generated number
			viewer_ids: [],
			region: guildRegion.name,
			paused: false,
		},
		guild_id: body.guild_id,
		channel_id: body.channel_id,
	});

	await emitEvent({
		event: "STREAM_SERVER_UPDATE",
		data: {
			token: streamSession.token,
			stream_key: streamKey,
			guild_id: null, // not sure why its always null
			endpoint: stream.endpoint,
		},
		user_id: this.user_id,
	});
}

//stream key:
// guild:${guild_id}:${channel_id}:${user_id}
// call:${channel_id}:${user_id}
