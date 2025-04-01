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

import { CLOSECODES, Payload, Send, WebSocket } from "@spacebar/gateway";
import {
	validateSchema,
	VoiceIdentifySchema,
	VoiceState,
} from "@spacebar/util";
import { mediaServer, VoiceOPCodes } from "@spacebar/webrtc";

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	const { server_id, user_id, session_id, token, streams, video } =
		validateSchema("VoiceIdentifySchema", data.d) as VoiceIdentifySchema;

	const voiceState = await VoiceState.findOne({
		where: { guild_id: server_id, user_id, token, session_id },
	});
	if (!voiceState) return this.close(CLOSECODES.Authentication_failed);

	this.user_id = user_id;
	this.session_id = session_id;

	this.client = mediaServer.join(voiceState.channel_id, this.user_id, this);

	this.on("close", () => {
		mediaServer.onClientClose(this.client!);
	});

	await Send(this, {
		op: VoiceOPCodes.READY,
		d: {
			streams: streams?.map((x) => ({
				...x,
				ssrc: 2,
				rtx_ssrc: 3,
			})),
			ssrc: 1,
			port: mediaServer.port,
			modes: [
				"aead_aes256_gcm_rtpsize",
				"aead_aes256_gcm",
				"aead_xchacha20_poly1305_rtpsize",
				"xsalsa20_poly1305_lite_rtpsize",
				"xsalsa20_poly1305_lite",
				"xsalsa20_poly1305_suffix",
				"xsalsa20_poly1305",
			],
			ip: mediaServer.ip,
			experiments: [],
		},
	});
}
