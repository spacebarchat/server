import { WebSocket, Payload } from "@fosscord/gateway";

export function onPresenceUpdate(this: WebSocket, data: Payload) {
	// return this.close(CLOSECODES.Unknown_error);
}
