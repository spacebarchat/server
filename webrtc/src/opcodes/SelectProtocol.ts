import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes } from "@fosscord/util";

export async function onSelectProtocol(socket: WebSocket, data: Payload) {
	socket.send(JSON.stringify({
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: "H264",
			secret_key: new Array(32).fill(null).map(x => Math.random() * 256),
			mode: "aead_aes256_gcm_rtpsize",
			media_session_id: "d8eb5c84d987c6642ec4ce72ffa97f00",
			audio_codec: "opus",
		}
	}));
}