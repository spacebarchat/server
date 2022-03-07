import { WebSocket, CLOSECODES } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes, Session, User, Guild } from "@fosscord/util";
import { Server } from "../Server";

export interface IdentifyPayload extends Payload {
	d: {
		server_id: string,	//guild id
		session_id: string,	//gateway session
		streams: Array<{
			type: string,
			rid: string,	//number
			quality: number,
		}>,
		token: string,		//voice_states token
		user_id: string,
		video: boolean,
	};
}

export async function onIdentify(this: Server, socket: WebSocket, data: IdentifyPayload) {

	const session = await Session.findOneOrFail(
		{ session_id: data.d.session_id, },
		{
			where: { user_id: data.d.user_id },
			relations: ["user"]
		}
	);
	const user = session.user;
	const guild = await Guild.findOneOrFail({ id: data.d.server_id }, { relations: ["members"] });

	if (!guild.members.find(x => x.id === user.id))
		return socket.close(CLOSECODES.Invalid_intent);

	var transport = this.mediasoupTransports[0] || await this.mediasoupRouters[0].createWebRtcTransport({
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



	/* 
		{
			"streams": [
				{ "type": "video", "ssrc": 129861, "rtx_ssrc": 129862, "rid": "100", "quality": 100, "active": false }
			],
			"ssrc": 129860,
			"port": 50003,
			"modes": [
				"aead_aes256_gcm_rtpsize",
				"aead_aes256_gcm",
				"xsalsa20_poly1305_lite_rtpsize",
				"xsalsa20_poly1305_lite",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305"
			],
			"ip": "109.200.213.251",
			"experiments": [
				"bwe_conservative_link_estimate",
				"bwe_remote_locus_client",
				"fixed_keyframe_interval"
			];
		};
	*/

	socket.send(JSON.stringify({
		op: VoiceOPCodes.READY,
		d: {
			streams: [...data.d.streams.map(x => ({ ...x, rtx_ssrc: Math.floor(Math.random() * 10000), ssrc: Math.floor(Math.random() * 10000), active: false, }))],
			ssrc: Math.floor(Math.random() * 10000),
			ip: transport.iceCandidates[0].ip,
			port: "50001",
			modes: [
				"aead_aes256_gcm_rtpsize",
				"aead_aes256_gcm",
				"xsalsa20_poly1305_lite_rtpsize",
				"xsalsa20_poly1305_lite",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305"
			],
			experiments: [],
		},
	}));
}