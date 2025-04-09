import { Payload, WebSocket } from "@spacebar/gateway";

interface StreamDeleteSchema {
	stream_key: string;
}

export async function onStreamDelete(this: WebSocket, data: Payload) {
	const body = data.d as StreamDeleteSchema;

	const splitStreamKey = body.stream_key.split(":");
	if (splitStreamKey.length < 3) {
		return this.close(4000, "Invalid stream key");
	}

	const type = splitStreamKey.shift()!;
	let guild_id: string;

	if (type === "guild") {
		guild_id = splitStreamKey.shift()!;
	}
	const channel_id = splitStreamKey.shift()!;
	const user_id = splitStreamKey.shift()!;

	if (this.user_id !== user_id) {
		return this.close(4000, "Cannot delete stream for another user");
	}

	// TODO: actually delete stream
}
