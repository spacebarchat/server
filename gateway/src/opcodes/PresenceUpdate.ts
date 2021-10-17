import { WebSocket, Payload } from "@fosscord/gateway";
import { emitEvent, PresenceUpdateEvent, Session, User } from "@fosscord/util";
import { ActivitySchema } from "../schema/Activity";
import { check } from "./instanceOf";

export async function onPresenceUpdate(this: WebSocket, { d }: Payload) {
	check.call(this, ActivitySchema, d);
	const presence = d as ActivitySchema;

	await Session.update(
		{ session_id: this.session_id },
		{ status: presence.status, activities: presence.activities }
	);

	await emitEvent({
		event: "PRESENCE_UPDATE",
		user_id: this.user_id,
		data: {
			user: await User.getPublicUser(this.user_id),
			activities: presence.activities,
			client_status: {}, // TODO:
			status: presence.status,
		},
	} as PresenceUpdateEvent);
}
