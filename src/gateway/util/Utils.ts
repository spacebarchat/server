export function parseStreamKey(streamKey: string): {
	type: "guild" | "call";
	channelId: string;
	guildId?: string;
	userId: string;
} {
	const streamKeyArray = streamKey.split(":");

	const type = streamKeyArray.shift();

	if (type !== "guild" && type !== "call") {
		throw new Error(`Invalid stream key type: ${type}`);
	}

	if (
		(type === "guild" && streamKeyArray.length < 3) ||
		(type === "call" && streamKeyArray.length < 2)
	)
		throw new Error(`Invalid stream key: ${streamKey}`); // invalid stream key

	let guildId: string | undefined;
	if (type === "guild") {
		guildId = streamKeyArray.shift();
	}
	const channelId = streamKeyArray.shift();
	const userId = streamKeyArray.shift();

	if (!channelId || !userId) {
		throw new Error(`Invalid stream key: ${streamKey}`);
	}
	return { type, channelId, guildId, userId };
}

export function generateStreamKey(
	type: "guild" | "call",
	guildId: string | undefined,
	channelId: string,
	userId: string,
): string {
	const streamKey = `${type}${type === "guild" ? `:${guildId}` : ""}:${channelId}:${userId}`;

	return streamKey;
}
