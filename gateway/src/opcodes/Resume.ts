import { WebSocket, Payload, Send } from "@fosscord/gateway";

export async function onResume(this: WebSocket, data: Payload) {
	console.log("Got Resume -> cancel not implemented");
	await Send(this, {
		op: 9,
		d: false,
	});

	// return this.close(CLOSECODES.Invalid_session);
}
