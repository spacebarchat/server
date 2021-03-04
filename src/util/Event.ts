import { Event, EventModel } from "fosscord-server-util";

export async function emitEvent(payload: Omit<Event, "created_at">) {
	const obj = {
		created_at: new Date(), // in seconds
		...payload,
	};

	return await new EventModel(obj).save();
}

export async function emitAuditLog(payload: any) {}
