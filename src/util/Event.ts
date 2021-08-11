import { Config, Event, EventModel, rabbitCon, rabbitCh } from "@fosscord/server-util";

export async function emitEvent(payload: Omit<Event, "created_at">) {
	if (rabbitCon) {
		const id = (payload.channel_id || payload.user_id || payload.guild_id) as string;
		if (!id) console.error("event doesn't contain any id", payload);
		const data = typeof payload.data === "object" ? JSON.stringify(payload.data) : payload.data; // use rabbitmq for event transmission

		// assertQueue isn't needed, because a queue will automatically created if it doesn't exist
		const successful = rabbitCh.sendToQueue(id, Buffer.from(`${data}`), { type: payload.event });
		if (!successful) throw new Error("failed to send event");
	} else {
		// use mongodb for event transmission
		// TODO: use event emitter for local server bundle
		const obj = {
			created_at: new Date(), // in seconds
			...payload
		};
		// TODO: bigint isn't working

		return await new EventModel(obj).save();
	}
}

export async function emitAuditLog(payload: any) {}
