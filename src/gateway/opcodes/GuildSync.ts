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

import { Member, Session, Presence, timePromise, Stopwatch, Config } from "@spacebar/util";
import { WebSocket, Payload, OPCODES, Send, getMostRelevantSession, handleOffloadedGatewayRequest } from "@spacebar/gateway";
import { PublicMember } from "@spacebar/schemas";
import { In } from "typeorm";

// TODO: only show roles/members that have access to this channel
// TODO: config: to list all members (even those who are offline) sorted by role, or just those who are online
// TODO: rewrite typeorm

export async function onGuildSync(this: WebSocket, { d }: Payload) {
    const sw = Stopwatch.startNew();
    if (!Array.isArray(d)) throw new Error("Invalid payload for GUILD_SYNC");

    if (Config.get().offload.gateway.guildSyncUrl !== null) {
        return await handleOffloadedGatewayRequest(this, Config.get().offload.gateway.guildSyncUrl!, d);
    }

    const guild_ids = d as string[];

    const joinedGuildIds = await Member.find({ where: { id: this.user_id, guild_id: In(guild_ids) }, select: { guild_id: true } }).then((members) =>
        members.map((m) => m.guild_id),
    );

    const tasks = joinedGuildIds.map((guildId) => timePromise(async () => handleGuildSync(this, guildId)));
    // not awaiting lol
    Promise.all(tasks)
        .then((res) => {
            console.log(`[Gateway/${this.user_id}] GUILD_SYNC processed ${guild_ids.length} guilds in ${sw.elapsed().totalMilliseconds}ms:`, {
                ...Object.fromEntries(
                    res.map((r) => [r.result.id, `${r.result.id}: ${r.result.members.length}U/${r.result.presences.length}P in ${r.elapsed.totalMilliseconds}ms`]),
                ),
            });
        })
        .catch((err) => {
            console.error(`[Gateway/${this.user_id}] Error processing GUILD_SYNC:`, err);
        });
}

interface GuildSyncResult {
    id: string;
    presences: Presence[];
    members: PublicMember[];
}

async function handleGuildSync(ws: WebSocket, guild_id: string) {
    const res: GuildSyncResult = { id: guild_id, presences: [], members: [] };

    const members = await Member.find({ where: { guild_id }, relations: { user: true, roles: true, guild: true } });
    res.members = members.map((m) => m.toPublicMember());

    const sessions = await Session.find({ where: { user_id: In(members.map((m) => m.id)) }, order: { user_id: "ASC" } });
    const sessionsByUserId = new Map<string, Session[]>();
    for (const session of sessions) {
        if (!sessionsByUserId.has(session.user_id)) sessionsByUserId.set(session.user_id, []);
        sessionsByUserId.get(session.user_id)!.push(session);
    }

    for (const member of members) {
        const userSessions = sessionsByUserId.get(member.id) || [];
        if (userSessions.length === 0) continue;

        const mostRelevantSession = getMostRelevantSession(userSessions);
        const presence: Presence = {
            user: member.user.toPublicUser(),
            guild_id: guild_id,
            status: mostRelevantSession.getPublicStatus(),
            activities: mostRelevantSession.activities,
            client_status: mostRelevantSession.client_status,
        };
        res.presences.push(presence);
    }

    await Send(ws, {
        op: OPCODES.Dispatch,
        t: "GUILD_SYNC",
        s: ws.sequence++,
        d: res,
    });

    return res;
}
