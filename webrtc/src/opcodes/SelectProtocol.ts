import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server"

export async function onSelectProtocol(this: Server, socket: WebSocket, data: Payload) {
	socket.send(JSON.stringify({
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: "H264",
			secret_key: new Array(32).fill(null).map(x => Math.random() * 256),
			mode: "aead_aes256_gcm_rtpsize",
			media_session_id: this.mediasoupTransports[0].id,
			audio_codec: "opus",
		}
	}));
}