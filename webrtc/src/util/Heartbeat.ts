import { WebSocket, CLOSECODES } from "@fosscord/gateway";
import { VoiceOPCodes } from "@fosscord/util";

export async function setHeartbeat(socket: WebSocket, nonce?: Number) {
	if (socket.heartbeatTimeout) clearTimeout(socket.heartbeatTimeout);

	socket.heartbeatTimeout = setTimeout(() => {
		return socket.close(CLOSECODES.Session_timed_out);
	}, 1000 * 45);

	if (!nonce) {
		socket.send(JSON.stringify({
			op: VoiceOPCodes.HELLO,
			d: {
				v: 5,
				heartbeat_interval: 13750,
			}
		}));
	}
	else {
		socket.send(JSON.stringify({ op: VoiceOPCodes.HEARTBEAT_ACK, d: nonce }));
	}
}