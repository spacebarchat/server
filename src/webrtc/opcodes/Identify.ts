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

import { CLOSECODES } from "@spacebar/gateway";
import {
	StreamSession,
	validateSchema,
	VoiceIdentifySchema,
	VoiceState,
} from "@spacebar/util";
import {
	mediaServer,
	VoiceOPCodes,
	VoicePayload,
	WebRtcWebSocket,
	Send,
	generateSsrc,
} from "@spacebar/webrtc";
import { subscribeToProducers } from "./Video";
import { SSRCs } from "spacebar-webrtc-types";

export async function onIdentify(this: WebRtcWebSocket, data: VoicePayload) {
	clearTimeout(this.readyTimeout);
	const { server_id, user_id, session_id, token, streams, video } =
		validateSchema("VoiceIdentifySchema", data.d) as VoiceIdentifySchema;

	// server_id can be one of the following: a unique id for a GO Live stream, a channel id for a DM voice call, or a guild id for a guild voice channel
	// not sure if there's a way to determine whether a snowflake is a channel id or a guild id without checking if it exists in db
	// luckily we will only have to determine this once
	let type: "guild-voice" | "dm-voice" | "stream" = "guild-voice";
	let authenticated = false;

	// first check if its a guild voice connection or DM voice call
	let voiceState = await VoiceState.findOne({
		where: [
			{ guild_id: server_id, user_id, token, session_id },
			{ channel_id: server_id, user_id, token, session_id },
		],
	});

	if (voiceState) {
		type = voiceState.guild_id === server_id ? "guild-voice" : "dm-voice";
		authenticated = true;
	} else {
		// if its not a guild/dm voice connection, check if it is a go live stream
		const streamSession = await StreamSession.findOne({
			where: {
				stream_id: server_id,
				user_id,
				token,
				session_id,
				used: false,
			},
			relations: ["stream"],
		});

		if (streamSession) {
			type = "stream";
			authenticated = true;
			streamSession.used = true;
			await streamSession.save();

			this.once("close", async () => {
				await streamSession.remove();
			});
		}
	}

	// if it doesnt match any then not valid token
	if (!authenticated) return this.close(CLOSECODES.Authentication_failed);

	this.user_id = user_id;
	this.session_id = session_id;

	this.type = type;

	const voiceRoomId = type === "stream" ? server_id : voiceState!.channel_id;
	this.webRtcClient = await mediaServer.join(
		voiceRoomId,
		this.user_id,
		this,
		type!,
	);

	this.on("close", () => {
		// ice-lite media server relies on this to know when the peer went away
		mediaServer.onClientClose(this.webRtcClient!);
	});

	// once connected subscribe to tracks from other users
	this.webRtcClient.emitter.once("connected", async () => {
		await subscribeToProducers.call(this);
	});

	// the server generates a unique ssrc for the audio and video stream. Must be unique among users connected to same server
	// UDP clients will respect this ssrc, but websocket clients will generate and replace it with their own
	const generatedSsrc: SSRCs = {
		audio_ssrc: generateSsrc(),
		video_ssrc: generateSsrc(),
		rtx_ssrc: generateSsrc(),
	};
	this.webRtcClient.initIncomingSSRCs(generatedSsrc);

	await Send(this, {
		op: VoiceOPCodes.READY,
		d: {
			ssrc: generatedSsrc.audio_ssrc,
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
			streams: streams?.map((x) => ({
				...x,
				ssrc: generatedSsrc.video_ssrc,
				rtx_ssrc: generatedSsrc.rtx_ssrc,
				type: "video", // client expects this to be overriden for some reason???
			})),
		},
	});
}
