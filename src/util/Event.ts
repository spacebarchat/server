import { Event, EventModel } from "fosscord-server-util";

export async function emitEvent(payload: Omit<Event, "created_at">) {
	const emitEvent = {
		created_at: new Date(), // in seconds
		...payload,
	};

	return await new EventModel(emitEvent).save();
}
