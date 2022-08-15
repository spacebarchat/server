import { validateSchema, VoiceIdentifySchema, VoiceState } from "@fosscord/util";
import { CloseCodes, Payload, Send, setHeartbeat, WebSocket } from "@fosscord/gateway";
import { VoiceOPCodes } from "../util/Constants";
import MediaServer from "medooze-media-server";
import { endpoint } from "./SelectProtocol";
import SemanticSDP from "semantic-sdp";
const defaultSDP = require("../../../assets/sdp.json");

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	const { server_id, user_id, session_id, token, streams, video } = validateSchema("VoiceIdentifySchema", data.d) as VoiceIdentifySchema;

	const voiceState = await VoiceState.findOneBy({ guild_id: server_id, user_id, token, session_id });
	if (!voiceState) return this.close(CloseCodes.Authentication_failed);

	this.user_id = user_id;
	this.session_id = session_id;
	this.sdp = SemanticSDP.SDPInfo.expand(defaultSDP);
	this.sdp.setDTLS(SemanticSDP.DTLSInfo.expand({ setup: "actpass", hash: "sha-256", fingerprint: endpoint.getDTLSFingerprint() }));

	this.ssrc = Math.randomIntBetween(10000, 99999);

	await Send(this, {
		op: VoiceOPCodes.READY,
		d: {
			streams: [
				// { type: "video", ssrc: this.ssrc + 1, rtx_ssrc: this.ssrc + 2, rid: "100", quality: 100, active: false }
			],
			ssrc: -1,
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
