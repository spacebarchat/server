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

import { WebSocket } from "@spacebar/gateway";
import { emitEvent, PresenceUpdateEvent, PrivateSessionProjection, Session, SessionsReplace, User, VoiceState, VoiceStateUpdateEvent } from "@spacebar/util";

export async function Close(this: WebSocket, code: number, reason: Buffer) {
	console.log("[WebSocket] closed", code, reason.toString());
	if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
	if (this.readyTimeout) clearTimeout(this.readyTimeout);
	this.deflate?.close();
	this.inflate?.close();
	this.removeAllListeners();

	if (this.session_id) {
		await Session.delete({ session_id: this.session_id });

		const voiceState = await VoiceState.findOne({
			where: { user_id: this.user_id },
		});

		// clear the voice state for this session if user was in voice channel
		if (voiceState && voiceState.session_id === this.session_id && voiceState.channel_id) {
			const prevGuildId = voiceState.guild_id;
			const prevChannelId = voiceState.channel_id;

			// @ts-expect-error channel_id is nullable
			voiceState.channel_id = null;
			// @ts-expect-error guild_id is nullable
			voiceState.guild_id = null;
			voiceState.self_stream = false;
			voiceState.self_video = false;
			await voiceState.save();

			// let the users in previous guild/channel know that user disconnected
			await emitEvent({
				event: "VOICE_STATE_UPDATE",
				data: {
					...voiceState.toPublicVoiceState(),
					guild_id: prevGuildId, // have to send the previous guild_id because that's what client expects for disconnect messages
				},
				guild_id: prevGuildId,
				channel_id: prevChannelId,
			} as VoiceStateUpdateEvent);
		}
	}

	if (this.user_id) {
		const sessions = await Session.find({
			where: { user_id: this.user_id },
			select: PrivateSessionProjection,
		});
		await emitEvent({
			event: "SESSIONS_REPLACE",
			user_id: this.user_id,
			data: sessions,
		} as SessionsReplace);
		const session = sessions[0] || {
			activities: [],
			client_status: {},
			status: "offline",
		};

		// TODO
		// If a user was deleted, they may still be connected to gateway,
		// which will cause this to throw when they disconnect.
		// just send the ID of the user instead of the full correct payload for now
		const userOrId = await User.getPublicUser(this.user_id).catch(() => ({
			id: this.user_id,
		}));

		await emitEvent({
			event: "PRESENCE_UPDATE",
			user_id: this.user_id,
			data: {
				user: userOrId,
				activities: session.activities,
				client_status: session?.client_status,
				status: session.getPublicStatus ? session.getPublicStatus() : session.status,
			},
		} as PresenceUpdateEvent);
	}
}
