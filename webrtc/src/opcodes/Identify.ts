import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index"
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server"

export async function onIdentify(this: Server, socket: WebSocket, data: Payload) {
	socket.send(JSON.stringify({
		op: VoiceOPCodes.READY,
		d: {
			ssrc: 1,
			ip: "127.0.0.1",

			//@ts-ignore
			port: this.mediasoupTransports[0].iceCandidates.port,
			modes: [
				"xsalsa20_poly1305",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305_lite",
			],
			heartbeat_interval: 1,
		},
	}));
}