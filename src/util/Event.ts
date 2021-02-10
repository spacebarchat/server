import { db } from "fosscord-server-util";

export async function emitEvent({
	guild,
	user,
	channel,
	event,
	data,
}: {
	guild?: bigint;
	channel?: bigint;
	user?: bigint;
	event: string;
	data: any;
}) {
	const emitEvent = {
		created_at: Math.floor(Date.now() / 1000), // in seconds
		guild_id: guild,
		user_id: user,
		channel_id: channel,
		data,
		event,
	};

	return await db.data.events.push(emitEvent);
}
