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

import {
	getPermission,
	GuildMembersChunkEvent,
	Member,
	Presence,
	RequestGuildMembersSchema,
} from "@spacebar/util";
import { WebSocket, Payload, OPCODES, Send } from "@spacebar/gateway";
import { check } from "./instanceOf";
import { FindManyOptions, In, Like } from "typeorm";

export async function onRequestGuildMembers(this: WebSocket, { d }: Payload) {
	// TODO: check data
	check.call(this, RequestGuildMembersSchema, d);

	const { guild_id, query, presences, nonce } =
		d as RequestGuildMembersSchema;
	let { limit, user_ids } = d as RequestGuildMembersSchema;

	if ("query" in d && (!limit || Number.isNaN(limit)))
		throw new Error('"query" requires "limit" to be set');
	if ("query" in d && user_ids)
		throw new Error('"query" and "user_ids" are mutually exclusive');
	if (user_ids && !Array.isArray(user_ids)) user_ids = [user_ids];
	user_ids = user_ids as string[] | undefined;

	// TODO: Configurable limit?
	if ((query || (user_ids && user_ids.length > 0)) && (!limit || limit > 100))
		limit = 100;

	const permissions = await getPermission(this.user_id, guild_id);
	permissions.hasThrow("VIEW_CHANNEL");

	const whereQuery: FindManyOptions["where"] = {};
	if (query) {
		whereQuery.user = {
			username: Like(query + "%"),
		};
	} else if (user_ids && user_ids.length > 0) {
		whereQuery.id = In(user_ids);
	}

	const memberFind: FindManyOptions = {
		where: {
			...whereQuery,
			guild_id,
		},
		relations: ["roles", ...(presences ? ["presence"] : [])],
	};
	if (limit) memberFind.take = Math.abs(Number(limit || 100));
	const members = await Member.find(memberFind);

	const baseData = {
		guild_id,
		nonce,
	};

	const chunkCount = Math.ceil(members.length / 1000);

	let notFound: string[] = [];
	if (user_ids && user_ids.length > 0)
		notFound = user_ids.filter(
			(id) => !members.some((member) => member.id == id),
		);

	const chunks: GuildMembersChunkEvent["data"][] = [];
	while (members.length > 0) {
		const chunk = members.splice(0, 1000);

		const presenceList: Presence[] = [];
		if (presences) {
			for await (const member of chunk) {
				presenceList.push(member.presence);
				delete member.presence;
			}
		}

		chunks.push({
			...baseData,
			members: chunk.map((member) => member.toPublicMember()),
			presences: presences ? presenceList : undefined,
			chunk_index: chunks.length,
			chunk_count: chunkCount,
		});
	}

	if (notFound.length > 0) chunks[0].not_found = notFound;

	chunks.forEach((chunk) => {
		Send(this, {
			op: OPCODES.Dispatch,
			s: this.sequence++,
			t: "GUILD_MEMBERS_CHUNK",
			d: chunk,
		});
	});
}
