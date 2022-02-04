import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server";

export async function onIdentify(this: Server, socket: WebSocket, data: Payload) {
	var transport = await this.mediasoupRouters[0].createWebRtcTransport({
		listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
		enableUdp: true,
		enableTcp: true,
		preferUdp: true,
	});

	/*
		//discord proper sends:
		{ 
			"streams": [
				{ "type": "video", "ssrc": 1311885, "rtx_ssrc": 1311886, "rid": "50", "quality": 50, "active": false },
				{ "type": "video", "ssrc": 1311887, "rtx_ssrc": 1311888, "rid": "100", "quality": 100, "active": false }
			],
			"ssrc": 1311884,
			"port": 50008,
			"modes": [
				"aead_aes256_gcm_rtpsize",
				"aead_aes256_gcm",
				"xsalsa20_poly1305_lite_rtpsize",
				"xsalsa20_poly1305_lite",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305"
			],
			"ip": "109.200.214.158",
			"experiments": [
				"bwe_conservative_link_estimate",
				"bwe_remote_locus_client",
				"fixed_keyframe_interval"
			]
		}
	*/

	socket.send(JSON.stringify({
		op: VoiceOPCodes.READY,
		d: {
			streams: [],
			ssrc: 1,
			ip: transport.iceCandidates[0].ip,
			port: transport.iceCandidates[0].port,
			modes: [
				"aead_aes256_gcm_rtpsize",
				// "xsalsa20_poly1305",
				// "xsalsa20_poly1305_suffix",
				// "xsalsa20_poly1305_lite",
			],
			heartbeat_interval: 1,
			experiments: [],
		},
	}));
}