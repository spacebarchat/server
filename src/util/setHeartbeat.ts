import WebSocket from "./WebSocket";

// TODO: make heartbeat timeout configurable
export function setHeartbeat(socket: WebSocket) {
	if (socket.heartbeatTimeout) clearTimeout(socket.heartbeatTimeout);

	socket.heartbeatTimeout = setTimeout(() => {
		return socket.close(4009);
	}, 1000 * 45);
}
