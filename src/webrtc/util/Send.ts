import { JSONReplacer } from "@spacebar/util";
import { VoicePayload } from "./Constants";
import { WebRtcWebSocket } from "./WebRtcWebSocket";

export function Send(socket: WebRtcWebSocket, data: VoicePayload) {
	if (process.env.WRTC_WS_VERBOSE)
		console.log(`[WebRTC] Outgoing message: ${JSON.stringify(data)}`);

	let buffer: Buffer | string;

	// TODO: encode circular object
	if (socket.encoding === "json") buffer = JSON.stringify(data, JSONReplacer);
	else return;

	return new Promise((res, rej) => {
		if (socket.readyState !== 1) {
			// return rej("socket not open");
			socket.close();
			return;
		}

		socket.send(buffer, (err) => {
			if (err) return rej(err);
			return res(null);
		});
	});
}
