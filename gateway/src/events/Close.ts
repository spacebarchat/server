import { WebSocket } from "@fosscord/gateway";
import {
	emitEvent,
	PresenceUpdateEvent,
	PrivateSessionProjection,
	Session,
	SessionsReplace,
	User,
} from "@fosscord/util";

export async function Close(this: WebSocket, code: number, reason: string) {
	console.log("[WebSocket] closed", code, reason);
	if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
	if (this.readyTimeout) clearTimeout(this.readyTimeout);
	this.deflate?.close();
	this.removeAllListeners();

	if (this.session_id) {
		await Session.delete({ session_id: this.session_id });
		const sessions = await Session.find({
			where: { user_id: this.user_id },
			select: PrivateSessionProjection,
		});
		await emitEvent({
			event: "SESSIONS_REPLACE",
			user_id: this.user_id,
			data: sessions,
		} as SessionsReplace);
		const session = sessions.first() || {
			activities: [],
			client_info: {},
			status: "offline",
		};

		await emitEvent({
			event: "PRESENCE_UPDATE",
			user_id: this.user_id,
			data: {
				user: await User.getPublicUser(this.user_id),
				activities: session.activities,
				client_status: session?.client_info,
				status: session.status,
			},
		} as PresenceUpdateEvent);
	}
}
