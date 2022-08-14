import { validateSchema, VoiceIdentifySchema, VoiceState } from "@fosscord/util";
import { CloseCodes, Payload, Send, setHeartbeat, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util/Constants";
import MediaServer from "medooze-media-server";

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	const { server_id, user_id, session_id, token, streams, video } = validateSchema("VoiceIdentifySchema", data.d) as VoiceIdentifySchema;

	const voiceState = await VoiceState.findOneBy({ guild_id: server_id, user_id, token, session_id });
	if (!voiceState) return this.close(CloseCodes.Authentication_failed);

	await Send(this, {
		op: VoiceOPCodes.READY,
		d: {
			streams: [{ type: "video", ssrc: 97605, rtx_ssrc: 97606, rid: "100", quality: 100, active: false }],
			ssrc: 97604,
			port: 3478,
			modes: [
				"aead_aes256_gcm_rtpsize",
				"aead_aes256_gcm",
				"xsalsa20_poly1305_lite_rtpsize",
				"xsalsa20_poly1305_lite",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305"
			],
			ip: "127.0.0.1",
			experiments: []
		}
	});
}
