import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { VoiceOPCodes } from "@fosscord/util";
import { Server } from "../Server";
import * as mediasoup from "mediasoup";
import { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";

const test = "extmap-allow-mixed\na=ice-ufrag:ilWh\na=ice-pwd:Mx7TDnPKXDnTgYWC+qMaqspQ\na=ice-options:trickle\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\na=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\na=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\na=rtpmap:111 opus/48000/2\na=extmap:14 urn:ietf:params:rtp-hdrext:toffset\na=extmap:13 urn:3gpp:video-orientation\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\na=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\na=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\na=rtpmap:96 VP8/90000\na=rtpmap:97 rtx/90000";

export async function onIdentify(this: Server, socket: WebSocket, data: Payload) {
	var transport = await this.mediasoupRouters[0].createWebRtcTransport({
		listenIps: [{ ip: "127.0.0.1" }],
		enableUdp: true,
		enableTcp: true,
		preferUdp: true,
	});

	const rtpCapabilities = this.mediasoupRouters[0].rtpCapabilities;
	const codecs = rtpCapabilities.codecs as RtpCodecCapability[];

	var producer = await transport.produce(
		{
			kind: "audio",
			rtpParameters:
			{
				mid: "1",
				codecs: codecs.filter(x => x.kind === "audio").map((x: RtpCodecCapability) => {
					return {
						mimeType: x.mimeType,
						kind: x.kind,
						clockRate: x.clockRate,
						channels: x.channels,
						payloadType: x.preferredPayloadType as number
					};
				}),
				headerExtensions: test.split("\na=").map((x, i) => ({
					id: i + 1,
					uri: x,
				}))
			}
		});

	const consumer = await transport.consume(
		{
			producerId: producer.id,
			rtpCapabilities:
			{
				codecs: codecs.filter(x => x.kind === "audio").map((x: RtpCodecCapability) => {
					return {
						mimeType: x.mimeType,
						kind: x.kind,
						clockRate: x.clockRate,
						channels: x.channels,
						payloadType: x.preferredPayloadType as number
					};
				}),
				headerExtensions: test.split("\na=").map((x, i) => ({
					kind: "audio",
					preferredId: i + 1,
					uri: x,
				}))
			}
		});

	socket.send(JSON.stringify({
		op: VoiceOPCodes.READY,
		d: {
			ssrc: 1,
			ip: "127.0.0.1",

			//@ts-ignore
			port: transport.iceCandidates[0].port,
			modes: [
				"xsalsa20_poly1305",
				// "xsalsa20_poly1305_suffix",
				// "xsalsa20_poly1305_lite",
			],
			heartbeat_interval: 1,
		},
	}));
}