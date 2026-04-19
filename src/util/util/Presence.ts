/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { emitEvent, Member, PresenceUpdateEvent, Recipient, Relationship, Session } from "@spacebar/util";
import { RelationshipType } from "@spacebar/schemas";
import { Not } from "typeorm";

export function getMostRelevantSession(sessions: Session[]) {
    const statusMap = {
        online: 0,
        idle: 1,
        dnd: 2,
        invisible: 3,
        offline: 4,
        unknown: 5,
    };
    // sort sessions by relevance
    sessions = sessions.sort((a, b) => statusMap[a.status] - statusMap[b.status] + ((a.activities?.length ?? 0) - (b.activities?.length ?? 0)) * 2);

    return sessions[0];
}

export async function distributePresenceUpdate(userId: string, data: PresenceUpdateEvent) {
    let relationships: Relationship[] | undefined = await Relationship.find({
        where: { from_id: userId, type: RelationshipType.friends },
        select: { from_id: true, to_id: true },
    });
    for (const rel of relationships)
        await emitEvent({
            ...data,
            user_id: rel.to_id,
        });
    // noinspection JSUnusedAssignment - drop array ref
    relationships = undefined;

    let memberGuildIds: string[] | undefined = (
        await Member.find({
            where: { id: userId },
            select: { guild_id: true },
        })
    ).map((x) => x.guild_id);
    for (const rel of memberGuildIds)
        await emitEvent({
            ...data,
            guild_id: rel,
        });
    // noinspection JSUnusedAssignment - drop array ref
    memberGuildIds = undefined;

    const recipients = await Recipient.find({ where: { user_id: userId, closed: false }, relations: { channel: true } });
    for (const recipient of recipients) {
        const otherRecipients = await Recipient.find({ where: { user_id: Not(userId), channel_id: recipient.channel_id } });
        for (const otherRcpt of otherRecipients) {
            if (otherRcpt.closed) continue;
            await emitEvent({
                ...data,
                user_id: otherRcpt.user_id,
            });
        }
    }
}
