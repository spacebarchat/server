import { parseStreamKey, Payload, WebSocket } from "@spacebar/gateway";
import { emitEvent, Stream } from "@spacebar/util";

interface StreamDeleteSchema {
	stream_key: string;
}

export async function onStreamDelete(this: WebSocket, data: Payload) {
	const body = data.d as StreamDeleteSchema;

	const { userId, channelId, guildId, type } = parseStreamKey(
		body.stream_key,
	);

	if (this.user_id !== userId) {
		return this.close(4000, "Cannot delete stream for another user");
	}

	const stream = await Stream.findOne({
		where: { channel_id: channelId, owner_id: userId },
	});

	if (!stream) return this.close(4000, "Invalid stream key");

	await stream.remove();

	await emitEvent({
		event: "STREAM_DELETE",
		data: {
			stream_key: body.stream_key,
		},
		guild_id: guildId,
		channel_id: channelId,
	});
}
