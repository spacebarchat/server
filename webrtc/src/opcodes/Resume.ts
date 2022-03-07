import { CLOSECODES, WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { Server } from "../Server"
import { Guild, Session, VoiceOPCodes } from "@fosscord/util";

export async function onResume(this: Server, socket: WebSocket, data: Payload) {
	const session = await Session.findOneOrFail(
		{ session_id: data.d.session_id, },
		{
			where: { user_id: data.d.user_id },
			relations: ["user"]
		}
	);
	const user = session.user;
	const guild = await Guild.findOneOrFail({ id: data.d.server_id }, { relations: ["members"] });

	if (!guild.members.find(x => x.id === user.id))
		return socket.close(CLOSECODES.Invalid_intent);

	socket.send(JSON.stringify({
		op: VoiceOPCodes.RESUMED,
		d: null,
	}))
}