import { CloseCodes, Payload, Send, WebSocket } from "@fosscord/gateway";
import { validateSchema, SelectProtocolSchema } from "@fosscord/util";
import { VoiceOPCodes } from "@fosscord/webrtc";
import MediaServer, { Transport } from "medooze-media-server";
import SemanticSDP from "semantic-sdp";

const PublicIP = "192.168.178.21";

MediaServer.enableLog(true);
export const endpoint = MediaServer.createEndpoint(PublicIP);
export const transports = new Map<string, Transport>();

export async function onSelectProtocol(this: WebSocket, payload: Payload) {
	const data = validateSchema("SelectProtocolSchema", payload.d) as SelectProtocolSchema;

	const offer = SemanticSDP.SDPInfo.parse("m=audio\n" + data.sdp!);
	this.sdp!.setICE(offer.getICE());
	this.sdp!.setDTLS(offer.getDTLS());
	console.log(offer);

	const transport = endpoint.createTransport(this.sdp!);
	transports.set(this.user_id, transport);
	transport.on("stopped", () => {
		transports.delete(this.user_id);
	});
	this.transport = transport;
	transport.setRemoteProperties(this.sdp!);
	transport.setLocalProperties(this.sdp!);

	const dtls = transport.getLocalDTLSInfo();
	const ice = transport.getLocalICEInfo();
	const port = endpoint.getLocalPort();
	const fingerprint = dtls.getHash() + " " + dtls.getFingerprint();
	const candidates = transport.getLocalCandidates();
	const candidate = candidates[0];

	const capabilities = MediaServer.getDefaultCapabilities();

	const answer = `m=audio ${port} ICE/SDP
a=fingerprint:${fingerprint}
c=IN IP4 ${PublicIP}
a=rtcp:${port}
a=ice-ufrag:${ice.getUfrag()}
a=ice-pwd:${ice.getPwd()}
a=fingerprint:${fingerprint}
a=candidate:1 1 ${candidate.getTransport()} ${candidate.getFoundation()} ${candidate.getAddress()} ${candidate.getPort()} typ host
`;

	await Send(this, {
		op: VoiceOPCodes.SELECT_PROTOCOL_ACK,
		d: {
			video_codec: "H264",
			sdp: answer,
			media_session_id: this.session_id,
			audio_codec: "opus"
		}
	});
}
