import {
	genVoiceToken,
	parseStreamKey,
	Payload,
	WebSocket,
} from "@spacebar/gateway";
import { Config, emitEvent, Stream, StreamSession } from "@spacebar/util";

interface StreamWatchSchema {
	stream_key: string;
}

export async function onStreamWatch(this: WebSocket, data: Payload) {
	const body = data.d as StreamWatchSchema;

	// TODO: apply perms: check if user is allowed to watch

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

	const { type, channelId, guildId, userId } = parsedKey;

	const stream = await Stream.findOne({
		where: { channel_id: channelId, owner_id: userId },
		relations: ["channel"],
	});

	if (!stream) return this.close(4000, "Invalid stream key");

	if (type === "guild" && stream.channel.guild_id != guildId)
		return this.close(4000, "Invalid stream key");

	const regions = Config.get().regions;
	const guildRegion = regions.available.find(
		(r) => r.endpoint === stream.endpoint,
	);

	if (!guildRegion) return this.close(4000, "Unknown region");

	const streamSession = StreamSession.create({
		stream_id: stream.id,
		user_id: this.user_id,
		session_id: this.session_id,
		token: genVoiceToken(),
	});

	await streamSession.save();

	const viewers = await StreamSession.find({
		where: { stream_id: stream.id },
	});

	await emitEvent({
		event: "STREAM_CREATE",
		data: {
			stream_key: body.stream_key,
			rtc_server_id: stream.id, // for voice connections in guilds it is guild_id, for dm voice calls it seems to be DM channel id, for GoLive streams a generated number
			viewer_ids: viewers.map((v) => v.user_id),
			region: guildRegion.name,
			paused: false,
		},
		guild_id: guildId,
		channel_id: channelId,
	});

	await emitEvent({
		event: "STREAM_SERVER_UPDATE",
		data: {
			token: streamSession.token,
			stream_key: body.stream_key,
			guild_id: null, // not sure why its always null
			endpoint: stream.endpoint,
		},
		user_id: this.user_id,
	});
}
