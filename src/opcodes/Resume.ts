import { CLOSECODES, Payload } from "../util/Constants";

import WebSocket from "../util/WebSocket";

export function onResume(this: WebSocket, data: Payload) {
	return this.close(CLOSECODES.Invalid_session);
}
