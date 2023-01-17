import { WebSocket } from "@fosscord/gateway";
import { Send } from "../util/Send";

export async function onResume(this: WebSocket) {
	console.log("Got Resume -> cancel not implemented");
	await Send(this, {
		op: 9,
		d: false,
	});

	// return this.close(CLOSECODES.Invalid_session);
}
