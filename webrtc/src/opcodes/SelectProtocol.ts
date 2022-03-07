import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server";
import * as mediasoup from "mediasoup";
import { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";
import * as sdpTransform from 'sdp-transform';


/*

	Sent by client:
{
	"op": 1,
	"d": {
		"protocol": "webrtc",
		"data": "
			a=extmap-allow-mixed
			a=ice-ufrag:vNxb
			a=ice-pwd:tZvpbVPYEKcnW0gGRPq0OOnh
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
		"codecs": [
			{
				"name": "opus",
				"type": "audio",
				"priority": 1000,
				"payload_type": 111,
				"rtx_payload_type": null
			},
			{
				"name": "H264",
				"type": "video",
				"priority": 1000,
				"payload_type": 102,
				"rtx_payload_type": 121
			},
			{
				"name": "VP8",
				"type": "video",
				"priority": 2000,
				"payload_type": 96,
				"rtx_payload_type": 97
			},
			{
				"name": "VP9",
				"type": "video",
				"priority": 3000,
				"payload_type": 98,
				"rtx_payload_type": 99
			}
		],
		"rtc_connection_id": "3faa0b80-b3e2-4bae-b291-273801fbb7ab"
	}
}

Sent by server:

{
	"op": 4,
	"d": {
		"video_codec": "H264",
		"sdp": "
			m=audio 50001 ICE/SDP
			a=fingerprint:sha-256 4A:79:94:16:44:3F:BD:05:41:5A:C7:20:F3:12:54:70:00:73:5D:33:00:2D:2C:80:9B:39:E1:9F:2D:A7:49:87
			c=IN IP4 109.200.214.158
			a=rtcp:50001
			a=ice-ufrag:CLzn
			a=ice-pwd:qEmIcNwigd07mu46Ok0XCh
			a=fingerprint:sha-256 4A:79:94:16:44:3F:BD:05:41:5A:C7:20:F3:12:54:70:00:73:5D:33:00:2D:2C:80:9B:39:E1:9F:2D:A7:49:87
			a=candidate:1 1 UDP 4261412862 109.200.214.158 50001 typ host
		",
		"media_session_id": "807955cb953e98c5b90704cf048e81ec",
		"audio_codec": "opus"
	}
}

*/


export async function onSelectProtocol(this: Server, socket: WebSocket, data: Payload) {
	const rtpCapabilities = this.mediasoupRouters[0].rtpCapabilities;
	const codecs = rtpCapabilities.codecs as RtpCodecCapability[];

	const transport = this.mediasoupTransports[0];	//whatever

	const res = sdpTransform.parse(data.d.sdp);

	const videoCodec = this.mediasoupRouters[0].rtpCapabilities.codecs!.find((x: any) => x.kind === "video");
	const audioCodec = this.mediasoupRouters[0].rtpCapabilities.codecs!.find((x: any) => x.kind === "audio");

	const producer = this.mediasoupProducers[0] || await transport.produce({
		kind: "audio",
		rtpParameters: {
			mid: "audio",
			codecs: [{
				clockRate: audioCodec!.clockRate,
				payloadType: audioCodec!.preferredPayloadType as number,
				mimeType: audioCodec!.mimeType,
				channels: audioCodec?.channels,
			}],
			headerExtensions: res.ext?.map(x => ({
				id: x.value,
				uri: x.uri,
			})),
		},
		paused: false,
	});

	console.log("can consume: " + this.mediasoupRouters[0].canConsume({ producerId: producer.id, rtpCapabilities: rtpCapabilities }));

	const consumer = this.mediasoupConsumers[0] || await transport.consume({
		producerId: producer.id,
		paused: false,
		rtpCapabilities,
	});

	socket.send(JSON.stringify({
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: videoCodec?.mimeType?.substring(6) || undefined,
			mode: "xsalsa20_poly1305_lite",
			media_session_id: transport.id,
			audio_codec: audioCodec?.mimeType.substring(6),
			sdp: `m=audio ${transport.iceCandidates[0].port} ICE/SDP\n`
				+ `a=fingerprint:sha-256 ${transport.dtlsParameters.fingerprints.find(x => x.algorithm === "sha-256")?.value}\n`
				+ `c=IN IPV4 ${transport.iceCandidates[0].ip}\n`
				+ `a=rtcp: ${transport.iceCandidates[0].port}\n`
				+ `a=ice-ufrag:${transport.iceParameters.usernameFragment}\n`
				+ `a=ice-pwd:${transport.iceParameters.password}\n`
				+ `a=fingerprint:sha-1 ${transport.dtlsParameters.fingerprints[0].value}\n`
				+ `a=candidate:1 1 ${transport.iceCandidates[0].protocol} ${transport.iceCandidates[0].priority} ${transport.iceCandidates[0].ip} ${transport.iceCandidates[0].port} typ ${transport.iceCandidates[0].type}`
		}
	}));
}