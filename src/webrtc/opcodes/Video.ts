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
import { Stream } from "@spacebar/util";
import { mediaServer, Send, VoiceOPCodes, VoicePayload, WebRtcWebSocket } from "@spacebar/webrtc";
import type { WebRtcClient } from "@spacebarchat/spacebar-webrtc-types";
import { validateSchema, VoiceVideoSchema } from "@spacebar/schemas";

export async function onVideo(this: WebRtcWebSocket, payload: VoicePayload) {
	if (!this.webRtcClient) return;

	const { voiceRoomId } = this.webRtcClient;

	const d = validateSchema("VoiceVideoSchema", payload.d) as VoiceVideoSchema;

	if (this.type === "stream") {
		const stream = await Stream.findOne({
			where: { id: voiceRoomId },
		});

		if (!stream) return;

		// only the stream owner can publish to a go live stream
		if (stream?.owner_id != this.user_id) {
			return;
		}
	}

	const stream = d.streams?.find((element) => element.active);

	const clientsThatNeedUpdate = new Set<WebRtcClient<WebRtcWebSocket>>();
	const wantsToProduceAudio = d.audio_ssrc !== 0;
	const wantsToProduceVideo = d.video_ssrc !== 0 && stream?.active;

	// this is to handle a really weird case where the client sends audio info before the
	// dtls ice connection is completely connected. Wait for connection for 3 seconds
	// and if no connection, just ignore this message
	if (!this.webRtcClient.webrtcConnected) {
		if (wantsToProduceAudio) {
			try {
				await Promise.race([
					new Promise<void>((resolve, reject) => {
						this.webRtcClient?.emitter.once("connected", () => resolve());
					}),
					new Promise<void>((resolve, reject) => {
						// Reject after 3 seconds if still not connected
						setTimeout(() => {
							if (this.webRtcClient?.webrtcConnected) resolve();
							else reject();
						}, 3000);
					}),
				]);
			} catch (e) {
				return; // just ignore this message if client didn't connect within 3 seconds
			}
		} else return;
	}

	await Send(this, { op: VoiceOPCodes.MEDIA_SINK_WANTS, d: { any: 100 } });

	// first check if we need stop any tracks
	if (!wantsToProduceAudio && this.webRtcClient.isProducingAudio()) {
		this.webRtcClient.stopPublishingTrack("audio");
	}

	if (!wantsToProduceVideo && this.webRtcClient.isProducingVideo()) {
		this.webRtcClient.stopPublishingTrack("video");
	}

	// check if client has signaled that it will send audio
	if (wantsToProduceAudio) {
		// check if we are already producing audio, if not, publish a new audio track for it
		if (!this.webRtcClient!.isProducingAudio()) {
			console.log(`[${this.user_id}] publishing new audio track ssrc:${d.audio_ssrc}`);
			await this.webRtcClient.publishTrack("audio", {
				audio_ssrc: d.audio_ssrc,
			});
		}

		// now check that all clients have subscribed to our audio
		for (const client of mediaServer.getClientsForRtcServer<WebRtcWebSocket>(voiceRoomId)) {
			if (client.user_id === this.user_id) continue;

			if (!client.isSubscribedToTrack(this.user_id, "audio")) {
				console.log(`[${client.user_id}] subscribing to audio track ssrcs: ${d.audio_ssrc}`);
				await client.subscribeToTrack(this.webRtcClient.user_id, "audio");

				clientsThatNeedUpdate.add(client);
			}
		}
	}
	// check if client has signaled that it will send video
	if (wantsToProduceVideo) {
		this.webRtcClient!.videoStream = { ...stream, type: "video" }; // client sends "screen" on go live but expects "video" on response
		// check if we are already publishing video, if not, publish a new video track for it
		if (!this.webRtcClient!.isProducingVideo()) {
			console.log(`[${this.user_id}] publishing new video track ssrc:${d.video_ssrc}`);
			await this.webRtcClient.publishTrack("video", {
				video_ssrc: d.video_ssrc,
				rtx_ssrc: d.rtx_ssrc,
			});
		}

		// now check that all clients have subscribed to our video track
		for (const client of mediaServer.getClientsForRtcServer<WebRtcWebSocket>(voiceRoomId)) {
			if (client.user_id === this.user_id) continue;

			if (!client.isSubscribedToTrack(this.user_id, "video")) {
				console.log(`[${client.user_id}] subscribing to video track ssrc: ${d.video_ssrc}`);
				await client.subscribeToTrack(this.webRtcClient.user_id, "video");

				clientsThatNeedUpdate.add(client);
			}
		}
	}

	await Promise.all(
		Array.from(clientsThatNeedUpdate).map((client) => {
			const ssrcs = client.getOutgoingStreamSSRCsForUser(this.user_id);

			return Send(client.websocket, {
				op: VoiceOPCodes.VIDEO,
				d: {
					user_id: this.user_id,
					// can never send audio ssrc as 0, it will mess up client state for some reason. send server generated ssrc as backup
					audio_ssrc: ssrcs.audio_ssrc ?? this.webRtcClient!.getIncomingStreamSSRCs().audio_ssrc,
					video_ssrc: ssrcs.video_ssrc ?? 0,
					rtx_ssrc: ssrcs.rtx_ssrc ?? 0,
					streams: d.streams?.map((x) => ({
						...x,
						ssrc: ssrcs.video_ssrc ?? 0,
						rtx_ssrc: ssrcs.rtx_ssrc ?? 0,
						type: "video",
					})),
				} as VoiceVideoSchema,
			});
		}),
	);
}

// check if we are not subscribed to producers in this server, if not, subscribe
export async function subscribeToProducers(this: WebRtcWebSocket): Promise<void> {
	if (!this.webRtcClient || !this.webRtcClient.webrtcConnected) return;

	const clients = mediaServer.getClientsForRtcServer<WebRtcWebSocket>(this.webRtcClient.voiceRoomId);

	await Promise.all(
		Array.from(clients).map(async (client) => {
			let needsUpdate = false;

			if (client.user_id === this.user_id) return; // cannot subscribe to self

			if (client.isProducingAudio() && !this.webRtcClient!.isSubscribedToTrack(client.user_id, "audio")) {
				await this.webRtcClient!.subscribeToTrack(client.user_id, "audio");
				needsUpdate = true;
			}

			if (client.isProducingVideo() && !this.webRtcClient!.isSubscribedToTrack(client.user_id, "video")) {
				await this.webRtcClient!.subscribeToTrack(client.user_id, "video");
				needsUpdate = true;
			}

			if (!needsUpdate) return;

			const ssrcs = this.webRtcClient!.getOutgoingStreamSSRCsForUser(client.user_id);

			await Send(this, {
				op: VoiceOPCodes.VIDEO,
				d: {
					user_id: client.user_id,
					// can never send audio ssrc as 0, it will mess up client state for some reason. send server generated ssrc as backup
					audio_ssrc: ssrcs.audio_ssrc ?? client.getIncomingStreamSSRCs().audio_ssrc,
					video_ssrc: ssrcs.video_ssrc ?? 0,
					rtx_ssrc: ssrcs.rtx_ssrc ?? 0,
					streams: [
						client.videoStream ?? {
							type: "video",
							rid: "100",
							ssrc: ssrcs.video_ssrc ?? 0,
							active: client.isProducingVideo(),
							quality: 100,
							rtx_ssrc: ssrcs.rtx_ssrc ?? 0,
							max_bitrate: 2500000,
							max_framerate: 20,
							max_resolution: {
								type: "fixed",
								width: 1280,
								height: 720,
							},
						},
					],
				} as VoiceVideoSchema,
			});
		}),
	);
}
