import { Payload, WebSocket } from "@fosscord/gateway";
import { ActivitySchema, emitEvent, PresenceUpdateEvent, Session, User } from "@fosscord/util";
import { check } from "./instanceOf";

export async function onPresenceUpdate(this: WebSocket, { d }: Payload) {
	check.call(this, ActivitySchema, d);
	const presence = d as ActivitySchema;

	await Session.update({ session_id: this.session_id }, { status: presence.status, activities: presence.activities });

	await emitEvent({
		event: "PRESENCE_UPDATE",
		user_id: this.user_id,
		data: {
			user: await User.getPublicUser(this.user_id),
			activities: presence.activities,
			client_status: {}, // TODO: add client status
			status: presence.status
		}
	} as PresenceUpdateEvent);
}
