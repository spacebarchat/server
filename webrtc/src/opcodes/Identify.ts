import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index"
import { VoiceOPCodes } from "@fosscord/util";

export async function onIdentify(socket: WebSocket, data: Payload) {
	socket.send(JSON.stringify({
		op: VoiceOPCodes.READY,
		d: {
			ssrc: 1,
			ip: "127.0.0.1",
			port: 3005,
			modes: [
				"xsalsa20_poly1305",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305_lite",
			],
			heartbeat_interval: 1,
		},
	}));
}