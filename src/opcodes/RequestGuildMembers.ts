import { CLOSECODES, Payload } from "../util/Constants";

import WebSocket from "../util/WebSocket";

export function onRequestGuildMembers(this: WebSocket, data: Payload) {
	return this.close(CLOSECODES.Unknown_error);
}
