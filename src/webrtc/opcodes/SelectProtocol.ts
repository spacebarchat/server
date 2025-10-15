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
import { SelectProtocolSchema, validateSchema } from "@spacebar/schemas";
import {
	VoiceOPCodes,
	VoicePayload,
	WebRtcWebSocket,
	mediaServer,
	Send,
} from "@spacebar/webrtc";

export async function onSelectProtocol(
	this: WebRtcWebSocket,
	payload: VoicePayload,
) {
	if (!this.webRtcClient) return;

	const data = validateSchema(
		"SelectProtocolSchema",
		payload.d,
	) as SelectProtocolSchema;

	// UDP protocol not currently supported. Maybe in the future?
	if (data.protocol !== "webrtc")
		return this.close(4000, "only webrtc protocol supported currently");

	const response = await mediaServer.onOffer(
		this.webRtcClient,
		data.sdp!,
		data.codecs ?? [],
	);

	await Send(this, {
		op: VoiceOPCodes.SESSION_DESCRIPTION,
		d: {
			video_codec: response.selectedVideoCodec,
			sdp: response.sdp,
			media_session_id: this.session_id,
			audio_codec: "opus",
		},
	});
}
