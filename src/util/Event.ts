import { Event, EventModel } from "fosscord-server-util";

export async function emitEvent(payload: Omit<Event, "created_at">) {
	const emitEvent = {
		created_at: Math.floor(Date.now() / 1000), // in seconds
		...payload,
	};

	return await new EventModel(emitEvent).save();
}
