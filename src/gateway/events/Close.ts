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
import { emitEvent, Member, PresenceUpdateEvent, Session, SessionsReplace, User, VoiceState, VoiceStateUpdateEvent, distributePresenceUpdate } from "@spacebar/util";
import { randomString } from "@spacebar/api";

export async function Close(this: WebSocket, code: number, reason: Buffer) {
    console.log("[WebSocket] closed", code, reason.toString());
    if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
    if (this.readyTimeout) clearTimeout(this.readyTimeout);
    this.deflate?.close();
    this.inflate?.close();
    this.removeAllListeners();

    if (this.session_id) {
        const authSessionId = this.session?.session_id;
        const closedAt = Date.now();

        setTimeout(async () => {
            console.log("Handling presence update after disconnect");
            try {
                if (authSessionId && this.user_id) {
                    const s = await Session.findOne({
                        where: { user_id: this.user_id, session_id: authSessionId },
                    });
                    if (s && (s.last_seen?.getTime() ?? 0) <= closedAt) {
                        console.log("... updating session");
                        await Session.update({ user_id: this.user_id, session_id: authSessionId }, { status: "offline", activities: [], client_status: {} });
                        this.session = await Session.findOneOrFail({ where: { session_id: this.session_id } });
                        console.log("... distributing PRESENCE_UPDATE");
                        await distributePresenceUpdate(this.user_id, {
                            event: "PRESENCE_UPDATE",
                            data: {
                                user: (await User.findOneOrFail({ where: { id: this.user_id } })).toPublicUser(),
                                status: this.session!.getPublicStatus(),
                                client_status: this.session!.client_status,
                                activities: this.session!.activities,
                            },
                            origin: "GATEWAY_CLOSE",
                            transaction_id: `IDENT_${this.user_id}_${randomString()}`,
                        } satisfies PresenceUpdateEvent);
                        console.log("... done!");
                    } else console.log("... Discarding presence update as the session reactivated");
                }
            } catch (e) {
                console.error("[WebSocket] Close session cleanup failed", code, e);
            }
        }, 10_000);

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

            voiceState.member = await Member.findOneOrFail({
                where: {
                    id: voiceState.user_id,
                    guild_id: prevGuildId,
                },
            });
            // let the users in previous guild/channel know that user disconnected
            await emitEvent({
                event: "VOICE_STATE_UPDATE",
                data: {
                    ...voiceState.toPublicVoiceState(),
                    guild_id: prevGuildId, // have to send the previous guild_id because that's what client expects for disconnect messages
                    member: voiceState.member.toPublicMember(),
                },
                guild_id: prevGuildId,
                channel_id: prevChannelId,
            } satisfies VoiceStateUpdateEvent);
        }
    }

    if (this.user_id) {
        const sessions = await Session.find({
            where: { user_id: this.user_id },
        });
        await emitEvent({
            event: "SESSIONS_REPLACE",
            user_id: this.user_id,
            data: sessions.map((x) => x.toPrivateGatewayDeviceInfo()),
        } as SessionsReplace);
        const session = sessions[0] || {
            activities: [],
            client_status: {},
            status: "offline",
        };

        const user = await User.getPublicUser(this.user_id).catch(() => undefined);

        // Special case: dont emit a presence update for deleted users
        if (user !== undefined)
            await emitEvent({
                event: "PRESENCE_UPDATE",
                user_id: this.user_id,
                data: {
                    user: user,
                    activities: session.activities,
                    client_status: session?.client_status,
                    status: session.getPublicStatus?.() ?? session.status,
                },
            } satisfies PresenceUpdateEvent);
    }
}
