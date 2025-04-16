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
import { validateSchema, VoiceVideoSchema } from "@spacebar/util";
import {
	mediaServer,
	VoiceOPCodes,
	VoicePayload,
	WebRtcWebSocket,
	Send,
} from "@spacebar/webrtc";
import type { WebRtcClient } from "spacebar-webrtc-types";

export async function onVideo(this: WebRtcWebSocket, payload: VoicePayload) {
	if (!this.webRtcClient || !this.webRtcClient.webrtcConnected) return;

	const { rtc_server_id } = this.webRtcClient;

	const d = validateSchema("VoiceVideoSchema", payload.d) as VoiceVideoSchema;

	const stream = d.streams?.find((element) => element !== undefined);

	await Send(this, { op: VoiceOPCodes.MEDIA_SINK_WANTS, d: { any: 100 } });

	const ssrcs = this.webRtcClient.getIncomingStreamSSRCs();

	const clientsThatNeedUpdate = new Set<WebRtcClient<WebRtcWebSocket>>();

	// check if client has signaled that it will send audio
	if (d.audio_ssrc !== 0) {
		// check if we already have incoming media for this ssrcs, if not, publish a new audio track for it
		if (ssrcs.audio_ssrc != d.audio_ssrc) {
			console.log(
				`[${this.user_id}] publishing new audio track ssrc:${d.audio_ssrc}`,
			);
			this.webRtcClient.publishTrack("audio", {
				audio_ssrc: d.audio_ssrc,
			});
		}

		// now check that all clients have outgoing media for this ssrcs
		for (const client of mediaServer.getClientsForRtcServer<WebRtcWebSocket>(
			rtc_server_id,
		)) {
			if (client.user_id === this.user_id) continue;

			const ssrcs = client.getOutgoingStreamSSRCsForUser(this.user_id);
			if (ssrcs.audio_ssrc != d.audio_ssrc) {
				console.log(
					`[${client.user_id}] subscribing to audio track ssrcs: ${d.audio_ssrc}`,
				);
				client.subscribeToTrack(this.webRtcClient.user_id, "audio");

				clientsThatNeedUpdate.add(client);
			}
		}
	}
	// check if client has signaled that it will send video
	if (d.video_ssrc !== 0 && stream?.active) {
		// check if we already have incoming media for this ssrcs, if not, publish a new video track for it
		if (ssrcs.video_ssrc != d.video_ssrc) {
			console.log(
				`[${this.user_id}] publishing new video track ssrc:${d.video_ssrc}`,
			);
			this.webRtcClient.publishTrack("video", {
				video_ssrc: d.video_ssrc,
				rtx_ssrc: d.rtx_ssrc,
			});
		}

		// now check that all clients have outgoing media for this ssrcs
		for (const client of mediaServer.getClientsForRtcServer<WebRtcWebSocket>(
			rtc_server_id,
		)) {
			if (client.user_id === this.user_id) continue;

			const ssrcs = client.getOutgoingStreamSSRCsForUser(
				this.webRtcClient.user_id,
			);
			if (ssrcs.video_ssrc != d.video_ssrc) {
				console.log(
					`[${client.user_id}] subscribing to video track ssrc: ${d.video_ssrc}`,
				);
				client.subscribeToTrack(this.webRtcClient.user_id, "video");

				clientsThatNeedUpdate.add(client);
			}
		}
	}

	for (const client of clientsThatNeedUpdate) {
		const ssrcs = client.getOutgoingStreamSSRCsForUser(this.user_id);

		Send(client.websocket, {
			op: VoiceOPCodes.VIDEO,
			d: {
				user_id: this.user_id,
				audio_ssrc: ssrcs.audio_ssrc ?? 0,
				video_ssrc: ssrcs.video_ssrc ?? 0,
				rtx_ssrc: ssrcs.rtx_ssrc ?? 0,
				streams: d.streams?.map((x) => ({
					...x,
					ssrc: ssrcs.video_ssrc ?? 0,
					rtx_ssrc: ssrcs.rtx_ssrc ?? 0,
				})),
			} as VoiceVideoSchema,
		});
	}
}
