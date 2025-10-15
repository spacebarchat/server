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
	DiscordApiErrors,
	emitEvent,
	Emoji,
	getPermission,
	getRights,
	Guild,
	GuildMemberUpdateEvent,
	handleFile,
	Member,
	PublicMemberProjection,
	PublicUserProjection,
	Role,
	Sticker,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { MemberChangeSchema } from "@spacebar/schemas"

const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "APIPublicMember",
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
		await Member.IsInGuildOrFail(req.user_id, guild_id);

		const member = await Member.findOneOrFail({
			where: { id: member_id, guild_id },
			relations: ["roles", "user"],
			select: {
				index: true,
				// only grab public member props
				...Object.fromEntries(
					PublicMemberProjection.map((x) => [x, true]),
				),
				// and public user props
				user: Object.fromEntries(
					PublicUserProjection.map((x) => [x, true]),
				),
				roles: {
					id: true,
				},
			},
		});

		return res.json({
			...member.toPublicMember(),
			user: member.user.toPublicUser(),
			roles: member.roles.map((x) => x.id),
		});
	},
);

router.patch(
	"/",
	route({
		requestBody: "MemberChangeSchema",
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
		const { guild_id } = req.params;
		const member_id =
			req.params.member_id === "@me" ? req.user_id : req.params.member_id;
		const body = req.body as MemberChangeSchema;

		const member = await Member.findOneOrFail({
			where: { id: member_id, guild_id },
			relations: ["roles", "user"],
		});
		const permission = await getPermission(req.user_id, guild_id);

		if ("nick" in body) {
			permission.hasThrow("MANAGE_NICKNAMES");

			if (!body.nick) {
				delete body.nick;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore shut up
				member.nick = null; // remove the nickname
			}
		}

		if (
			("bio" in body || "avatar" in body) &&
			req.params.member_id != "@me"
		) {
			const rights = await getRights(req.user_id);
			rights.hasThrow("MANAGE_USERS");
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
			permission.hasThrow("MANAGE_ROLES");

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

router.put(
	"/",
	route({
		responses: {
			200: {
				body: "MemberJoinGuildResponse",
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
		// TODO: Lurker mode

		const rights = await getRights(req.user_id);

		const { guild_id } = req.params;
		let { member_id } = req.params;
		if (member_id === "@me") {
			member_id = req.user_id;
			rights.hasThrow("JOIN_GUILDS");
		} else {
			// TODO: check oauth2 scope

			throw DiscordApiErrors.MISSING_REQUIRED_OAUTH2_SCOPE;
		}

		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
		});

		const emoji = await Emoji.find({
			where: { guild_id: guild_id },
		});

		const roles = await Role.find({
			where: { guild_id: guild_id },
		});

		const stickers = await Sticker.find({
			where: { guild_id: guild_id },
		});

		await Member.addToGuild(member_id, guild_id);
		res.send({ ...guild, emojis: emoji, roles: roles, stickers: stickers });
	},
);

router.delete(
	"/",
	route({
		responses: {
			204: {},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id, member_id } = req.params;
		const permission = await getPermission(req.user_id, guild_id);
		const rights = await getRights(req.user_id);
		if (member_id === "@me" || member_id === req.user_id) {
			// TODO: unless force-joined
			rights.hasThrow("SELF_LEAVE_GROUPS");
		} else {
			rights.hasThrow("KICK_BAN_MEMBERS");
			permission.hasThrow("KICK_MEMBERS");
		}

		await Member.removeFromGuild(member_id, guild_id);
		res.sendStatus(204);
	},
);

export default router;
