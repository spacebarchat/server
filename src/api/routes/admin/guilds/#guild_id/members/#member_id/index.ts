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

import { route } from "@spacebar/api";
import {
	GuildMemberUpdateEvent,
	Member,
	MemberChangeSchema,
	Role,
	emitEvent,
	handleFile,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.patch(
	"/",
	route({
		description: "Update a guild member",
		requestBody: "MemberChangeSchema",
		right: "ADMIN_UPDATE_MEMBERS",
		responses: {
			200: {
				body: "Member",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id, member_id } = req.params;
		const body = req.body as MemberChangeSchema;

		const member = await Member.findOneOrFail({
			where: { id: member_id, guild_id },
			relations: ["roles", "user"],
		});

		if ("nick" in body) {
			if (!body.nick) {
				delete body.nick;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore shut up
				member.nick = null; // remove the nickname
			}
		}

		if (body.avatar)
			body.avatar = await handleFile(
				`/guilds/${guild_id}/users/${member_id}/avatars`,
				body.avatar as string,
			);

		member.assign(body);

		// must do this after the assign because the body roles array
		// is string[] not Role[]
		if ("roles" in body) {
			body.roles = body.roles || [];
			body.roles.filter((x) => !!x);

			if (body.roles.indexOf(guild_id) === -1) body.roles.push(guild_id);
			// foreign key constraint will fail if role doesn't exist
			member.roles = body.roles.map((x) => Role.create({ id: x }));
		}

		await member.save();

		member.roles = member.roles.filter((x) => x.id !== guild_id);

		// do not use promise.all as we have to first write to db before emitting the event to catch errors
		await emitEvent({
			event: "GUILD_MEMBER_UPDATE",
			guild_id,
			data: { ...member, roles: member.roles.map((x) => x.id) },
		} as GuildMemberUpdateEvent);

		res.json(member);
	},
);

router.delete(
	"/",
	route({
		description: "Remove a member from a guild",
		right: "ADMIN_DELETE_MEMBERS",
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id, member_id } = req.params;
		await Member.removeFromGuild(member_id, guild_id);
		res.sendStatus(204);
	},
);

export default router;
