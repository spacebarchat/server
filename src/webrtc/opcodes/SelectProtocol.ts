/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Payload, Send, WebSocket } from "@spacebar/gateway";
import { SelectProtocolSchema, validateSchema } from "@spacebar/util";
import { PublicIP, VoiceOPCodes, endpoint } from "@spacebar/webrtc";
import SemanticSDP, { MediaInfo, SDPInfo } from "semantic-sdp";

export async function onSelectProtocol(this: WebSocket, payload: Payload) {
	if (!this.client) return;

	const data = validateSchema("SelectProtocolSchema", payload.d) as SelectProtocolSchema;

	const offer = SemanticSDP.SDPInfo.parse("m=audio\n" + data.sdp!);
	this.client.sdp!.setICE(offer.getICE());
	this.client.sdp!.setDTLS(offer.getDTLS());

	const transport = endpoint.createTransport(this.client.sdp!);
	this.client.transport = transport;
	transport.setRemoteProperties(this.client.sdp!);
	transport.setLocalProperties(this.client.sdp!);

	const dtls = transport.getLocalDTLSInfo();
	const ice = transport.getLocalICEInfo();
	const port = endpoint.getLocalPort();
	const fingerprint = dtls.getHash() + " " + dtls.getFingerprint();
	const candidates = transport.getLocalCandidates();
	const candidate = candidates[0];

	const answer =
		`m=audio ${port} ICE/SDP` +
		`a=fingerprint:${fingerprint}` +
		`c=IN IP4 ${PublicIP}` +
		`a=rtcp:${port}` +
		`a=ice-ufrag:${ice.getUfrag()}` +
		`a=ice-pwd:${ice.getPwd()}` +
		`a=fingerprint:${fingerprint}` +
		`a=candidate:1 1 ${candidate.getTransport()} ${candidate.getFoundation()} ${candidate.getAddress()} ${candidate.getPort()} typ host`;

	await Send(this, {
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: "H264",
			sdp: answer,
			media_session_id: this.session_id,
			audio_codec: "opus",
		},
	});
}
