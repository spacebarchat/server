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

import { OPCODES, Payload, Send, WebSocket } from "@spacebar/gateway";
import { Member, RequestGuildMembersSchema, getDatabase } from "@spacebar/util";
import { check } from "./instanceOf";

function partition(members: Member[], size: number) {
	const chunks = [];

	for (let i = 0; i < members.length; i += size) {
		chunks.push(members.slice(i, i + size));
	}

	return chunks;
}

export async function onRequestGuildMembers(this: WebSocket, { d }: Payload) {
	check.call(this, RequestGuildMembersSchema, d);

	const { guild_id, query, limit, presences, user_ids, nonce } =
		d as RequestGuildMembersSchema;

	if (query && user_ids) {
		throw new Error("Cannot query and provide user ids");
	}

	if (query && !limit) {
		throw new Error("Must provide limit when querying");
	}

	const takeLimit =
		(query && query !== "") || user_ids
			? limit && limit !== 0 && limit <= 1000
				? limit
				: 100
			: undefined;

	const member_count = await Member.count({
		where: {
			guild_id,
		},
	});

	// TODO: if member count is >75k, only return members in voice plus the connecting users member object
	// TODO: if member count is >large_threshold, send members who are online, have a role, have a nickname, or are in a voice channel
	// TODO: if member count is <large_threshold, send all members

	let members: Member[] = [];

	if (member_count > 75000) {
		// since we dont have voice channels yet, just return the connecting users member object
		members = await Member.find({
			where: {
				guild_id,
				user: {
					id: this.user_id,
				},
			},
			relations: ["user", "roles"],
		});
	} else if (member_count > this.large_threshold) {
		try {
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
				.andWhere(
					`',' || member.roles || ',' NOT LIKE :everyoneRoleIdList`,
					{ everyoneRoleIdList: `%,${guild_id},%` },
				)
				.andWhere("session.status != 'offline'")
				.addOrderBy("user.username", "ASC")
				.limit(takeLimit);

			if (query && query !== "") {
				q.andWhere(`user.username ILIKE :query`, {
					query: `${query}%`,
				});
			} else if (user_ids) {
				q.andWhere(`user.id IN (:...user_ids)`, { user_ids });
			}

			members = await q.getMany();
		} catch (e) {
			console.error(`request guild members`, e);
		}
	} else {
		members = await Member.find({
			where: {
				guild_id,
				...(user_ids && { user_id: user_ids }),
				...(query && { username: { startsWith: query } }),
			},
			take: takeLimit,
			relations: ["user", "roles"],
		});
	}

	const chunks = partition(members, 1000);

	for (const [i, chunk] of chunks.entries()) {
		await Send(this, {
			op: OPCODES.Dispatch,
			s: this.sequence++,
			t: "GUILD_MEMBERS_CHUNK",
			d: {
				guild_id,
				members: chunk.map((member) => ({
					...member,
					roles: member.roles.map((role) => role.id),
					user: member.user.toPublicUser(),
				})),
				chunk_index: i + 1,
				chunk_count: chunks.length,
				// not_found: []
				// presences: []
				nonce,
			},
		});
	}
}
