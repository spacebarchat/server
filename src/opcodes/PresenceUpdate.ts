import { CLOSECODES, Payload } from "../util/Constants";
import WebSocket from "../util/WebSocket";

export function onPresenceUpdate(this: WebSocket, data: Payload) {
	return this.close(CLOSECODES.Unknown_error);
}
