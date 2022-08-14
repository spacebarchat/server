import { Payload, Send, WebSocket } from "@fosscord/gateway";
import { validateSchema, SelectProtocolSchema } from "@fosscord/util";
import { VoiceOPCodes } from "@fosscord/webrtc";
import MediaServer from "medooze-media-server";
import SemanticSDP from "semantic-sdp";

/*
example sdp:

a=extmap-allow-mixed
a=ice-ufrag:wQxC
a=ice-pwd:8dcZV5hEcEQ99DVxYMF5j3DF
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
*/

export async function onSelectProtocol(this: WebSocket, payload: Payload) {
	const data = validateSchema("SelectProtocolSchema", payload.d) as SelectProtocolSchema;

	const endpoint = MediaServer.createEndpoint("127.0.0.1");
	console.log("sdp", data.sdp);
	const offer = SemanticSDP.SDPInfo.parse(data.sdp!);
	console.log("offer", offer);

	const transport = endpoint.createTransport(offer);
	console.log({ transport });
	transport.setRemoteProperties(offer);

	const dtls = transport.getLocalDTLSInfo();
	const ice = transport.getLocalICEInfo();
	const candidates = endpoint.getLocalCandidates();
	const capabilities = MediaServer.getDefaultCapabilities();

	const answer = offer.answer({
		dtls,
		ice,
		candidates,
		capabilities
	});
	console.log(answer.plain());
	const answerSdp = answer.toString();
	console.log(answerSdp);

	await Send(this, {
		op: VoiceOPCodes.SELECT_PROTOCOL_ACK,
		d: {
			video_codec: "H264",
			sdp: answerSdp,
			media_session_id: "45e37815a2dff5a82ac0ab818706c784",
			audio_codec: "opus"
		}
	});
}

`m=audio 3478 ICE/SDP
a=fingerprint:sha-256 4A:79:94:16:44:3F:BD:05:41:5A:C7:20:F3:12:54:70:00:73:5D:33:00:2D:2C:80:9B:39:E1:9F:2D:A7:49:87
c=IN IP4 127.0.0.1
a=rtcp:3478
a=ice-ufrag:BG+c
a=ice-pwd:7dKOmilzu2oeZh+L9FOc0/
a=fingerprint:sha-256 4A:79:94:16:44:3F:BD:05:41:5A:C7:20:F3:12:54:70:00:73:5D:33:00:2D:2C:80:9B:39:E1:9F:2D:A7:49:87
a=candidate:1 1 UDP 4261412862 127.0.0.1 3478 typ host
`;
