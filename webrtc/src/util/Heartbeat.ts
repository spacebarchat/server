import { WebSocket, CLOSECODES } from "@fosscord/gateway";
import { VoiceOPCodes } from "@fosscord/util";

export async function setHeartbeat(socket: WebSocket) {
	if (socket.heartbeatTimeout) clearTimeout(socket.heartbeatTimeout);

	socket.heartbeatTimeout = setTimeout(() => {
		return socket.close(CLOSECODES.Session_timed_out);
	}, 1000 * 45);

	socket.send(JSON.stringify({
		op: VoiceOPCodes.HEARTBEAT_ACK,
		d: {
			v: 6,
			heartbeat_interval: 13750,
		}
	}));
}