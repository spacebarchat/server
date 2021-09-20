import { CLOSECODES } from "./Constants";
import { WebSocket } from "./WebSocket";

// TODO: make heartbeat timeout configurable
export function setHeartbeat(socket: WebSocket) {
	if (socket.heartbeatTimeout) clearTimeout(socket.heartbeatTimeout);

	socket.heartbeatTimeout = setTimeout(() => {
		return socket.close(CLOSECODES.Session_timed_out);
	}, 1000 * 45);
}
