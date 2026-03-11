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

import { DateBuilder, getDatabase, getPermission, GuildMembersChunkEvent, Member, Presence, Session } from "@spacebar/util";
import { WebSocket, Payload, OPCODES, Send } from "@spacebar/gateway";
import { check } from "./instanceOf";
import { FindManyOptions, ILike, In, MoreThan } from "typeorm";
import { RequestGuildMembersSchema } from "@spacebar/schemas";

export async function onRequestGuildMembers(this: WebSocket, { d }: Payload) {
    const startTime = Date.now();
    // Schema validation can only accept either string or array, so transforming it here to support both
    if (!d.guild_id) throw new Error('"guild_id" is required');
    d.guild_id = Array.isArray(d.guild_id) ? d.guild_id[0] : d.guild_id;

    if (d.user_ids && !Array.isArray(d.user_ids)) d.user_ids = [d.user_ids];

    check.call(this, RequestGuildMembersSchema, d);

    const { presences, nonce, query: requestQuery } = d as RequestGuildMembersSchema;
    let { limit, user_ids, guild_id } = d as RequestGuildMembersSchema;

    // some discord libraries send empty string as query when they meant to send undefined, which was leading to errors being thrown in this handler
    const query = requestQuery != "" ? requestQuery : undefined;

    guild_id = guild_id as string;
    user_ids = user_ids as string[] | undefined;

    if (d.query && (!limit || Number.isNaN(limit))) {
        console.log("Query:", d);
        throw new Error('"query" requires "limit" to be set');
    }

    if (d.query && user_ids) {
        console.log("Query:", d);
        throw new Error('"query" and "user_ids" are mutually exclusive');
    }

    // TODO: Configurable limit?
    if ((query || (user_ids && user_ids.length > 0)) && (!limit || limit > 100)) limit = 100;

    const permissions = await getPermission(this.user_id, guild_id);
    permissions.hasThrow("VIEW_CHANNEL");

    const memberCount = await Member.count({
        where: {
            guild_id,
        },
    });

    const memberFind: FindManyOptions = {
        where: {
            guild_id,
        },
        relations: { user: true, roles: true },
    };
    if (limit) memberFind.take = Math.abs(Number(limit || 100));

    let members: Member[] = [];

    if (memberCount > 75000) {
        // since we dont have voice channels yet, just return the connecting users member object
        members = await Member.find({
            ...memberFind,
            where: {
                ...memberFind.where,
                user: {
                    id: this.user_id,
                },
            },
        });
    } else if (memberCount > this.large_threshold) {
        // find all members who are online, have a role, have a nickname, or are in a voice channel, as well as respecting the query and user_ids
        const db = getDatabase();
        if (!db) throw new Error("Database not initialized");
        const repo = db.getRepository(Member);
        const q = repo
            .createQueryBuilder("member")
            .where("member.guild_id = :guild_id", { guild_id })
            .leftJoinAndSelect("member.roles", "role")
            .leftJoinAndSelect("member.user", "user")
            .leftJoinAndSelect("user.sessions", "session")
            .andWhere("',' || member.roles || ',' NOT LIKE :everyoneRoleIdList", { everyoneRoleIdList: "%," + guild_id + ",%" })
            .addOrderBy("user.username", "ASC")
            .limit(memberFind.take);

        if (query && query != "") {
            q.andWhere(`user.username ILIKE :query`, {
                query: `${query}%`,
            });
        } else if (user_ids) {
            q.andWhere(`user.id IN (:...user_ids)`, { user_ids });
        }

        members = await q.getMany();
    } else {
        if (query) {
            // @ts-expect-error memberFind.where is very much defined
            memberFind.where.user = {
                username: ILike(query + "%"),
            };
        } else if (user_ids && user_ids.length > 0) {
            // @ts-expect-error memberFind.where is still very much defined
            memberFind.where.id = In(user_ids);
        }

        members = await Member.find(memberFind);
    }

    const baseData = {
        guild_id,
        nonce,
    };

    const memberResultCount = members.length;
    const chunkSize = 1000;
    const chunkCount = Math.ceil(members.length / chunkSize);
    let sentChunkCount = 0;

    let notFound: string[] = [];
    if (user_ids && user_ids.length > 0) notFound = user_ids.filter((id) => !members.some((member) => member.id == id));

    const recentlyActiveSince = new DateBuilder().addMinutes(-15).build();

    while (members.length > 0) {
        const chunk: Member[] = members.splice(0, chunkSize);

        let presenceList: Presence[] = [];
        if (presences) {
            const sessions = await Session.find({
                where: { user_id: In(chunk.map((m) => m.id)), is_admin_session: false, last_seen: MoreThan(recentlyActiveSince) },
                select: {
                    user: true,
                    status: true,
                    activities: true,
                    client_status: true,
                },
                relations: { user: true },
            });

            const foundUids = new Set<string>();
            presenceList = sessions
                .filter((s) => {
                    if (foundUids.has(s.user.id)) return false;
                    foundUids.add(s.user.id);
                    return true;
                })
                .map((session) => ({
                    user: session.user.toPublicUser(),
                    status: session.getPublicStatus(),
                    activities: session.activities,
                    client_status: session.client_status,
                }));
        }

        await Send(this, {
            op: OPCODES.Dispatch,
            s: this.sequence++,
            t: "GUILD_MEMBERS_CHUNK",
            d: {
                ...baseData,
                members: chunk.map((member) => member.toPublicMember()),
                presences: presences ? presenceList : undefined,
                chunk_index: sentChunkCount,
                chunk_count: chunkCount,

                ...(sentChunkCount == 0 ? { not_found: notFound } : {}),
            } satisfies GuildMembersChunkEvent["data"],
        });
        sentChunkCount++;

        console.log(
            `[Gateway/${this.user_id}] REQUEST_GUILD_MEMBERS @ ${Date.now() - startTime}ms for guild ${guild_id}: pushed ${sentChunkCount}/${chunkCount} chunks (${memberResultCount} total members considered)`,
        );
    }

    if (sentChunkCount == 0)
        await Send(this, {
            op: OPCODES.Dispatch,
            s: this.sequence++,
            t: "GUILD_MEMBERS_CHUNK",
            d: {
                ...baseData,
                members: [],
                presences: presences ? [] : undefined,
                chunk_index: 0,
                chunk_count: 1,
                not_found: notFound,
            } satisfies GuildMembersChunkEvent["data"],
        });

    console.log(`[Gateway/${this.user_id}] REQUEST_GUILD_MEMBERS took ${Date.now() - startTime}ms for guild ${guild_id} with ${memberResultCount} (${memberCount}) members`);
}
