import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server";
import * as mediasoup from "mediasoup";
import { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";
import * as sdpTransform from 'sdp-transform';

/*
	{
	op: 1,
	d: {
		protocol: "webrtc",
		data: "
			a=extmap-allow-mixed
			a=ice-ufrag:ilWh
			a=ice-pwd:Mx7TDnPKXDnTgYWC+qMaqspQ
			a=ice-options:trickle
			a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
			a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
			a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
			a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
			a=rtpmap:111 opus/48000/2
			a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
			a=extmap:13 urn:3gpp:video-orientation
			a=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
			a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type
			a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing
			a=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space
			a=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
			a=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
			a=rtpmap:96 VP8/90000
			a=rtpmap:97 rtx/90000
		",
		sdp: "same data as in d.data? also not documented by discord",
		codecs: [
		{
			name: "opus",
			type: "audio",
			priority: 1000,
			payload_type: 111,
			rtx_payload_type: null,
		},
		{
			name: "H264",
			type: "video",
			priority: 1000,
			payload_type: 102,
			rtx_payload_type: 121,
		},
		{
			name: "VP8",
			type: "video",
			priority: 2000,
			payload_type: 96,
			rtx_payload_type: 97,
		},
		{
			name: "VP9",
			type: "video",
			priority: 3000,
			payload_type: 98,
			rtx_payload_type: 99,
		},
		],
		rtc_connection_id: "b3c8628a-edb5-49ae-b860-ab0d2842b104",
	},
	}
*/

export async function onSelectProtocol(this: Server, socket: WebSocket, data: Payload) {
	const rtpCapabilities = this.mediasoupRouters[0].rtpCapabilities;
	const codecs = rtpCapabilities.codecs as RtpCodecCapability[];

	const transport = this.mediasoupTransports[0];	//whatever

	const res = sdpTransform.parse(data.d.sdp);

	/*
	 res.media.map(x => x.rtp).flat(1).map(x => ({
				codec: x.codec,
				payloadType: x.payload,
				clockRate: x.rate as number,
				mimeType: `audio/${x.codec}`,
			})),
	*/

	const producer = await transport.produce({
		kind: "audio",
		rtpParameters: {
			mid: "audio",
			codecs: [{
				clockRate: 48000,
				payloadType: 111,
				mimeType: "audio/opus",
				channels: 2,
			}],
			headerExtensions: res.ext?.map(x => ({
				id: x.value,
				uri: x.uri,
			}))
		},
		paused: false,
	});

	socket.send(JSON.stringify({
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: data.d.codecs.find((x: any) => x.type === "video").name,
			secret_key: new Array(32).fill(null).map(x => Math.random() * 256),
			mode: "xsalsa20_poly1305",
			media_session_id: this.mediasoupTransports[0].id,
			audio_codec: data.d.codecs.find((x: any) => x.type === "audio").name,
		}
	}));
}