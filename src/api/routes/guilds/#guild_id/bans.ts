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

import { getIpAdress, route } from "@spacebar/api";
import {
	Ban,
	BanRegistrySchema,
	DiscordApiErrors,
	GuildBanAddEvent,
	GuildBanRemoveEvent,
	Member,
	User,
	emitEvent,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router: Router = Router();

/* TODO: Deleting the secrets is just a temporary go-around. Views should be implemented for both safety and better handling. */

router.get(
	"/",
	route({
		permission: "BAN_MEMBERS",
		responses: {
			200: {
				body: "GuildBansResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;

		const bans = await Ban.find({ where: { guild_id: guild_id } });
		const promisesToAwait: object[] = [];
		const bansObj: object[] = [];

		bans.filter((ban) => ban.user_id !== ban.executor_id); // pretend self-bans don't exist to prevent victim chasing

		bans.forEach((ban) => {
			promisesToAwait.push(User.getPublicUser(ban.user_id));
		});

		const bannedUsers: object[] = await Promise.all(promisesToAwait);

		bans.forEach((ban, index) => {
			const user = bannedUsers[index] as User;
			bansObj.push({
				reason: ban.reason,
				user: {
					username: user.username,
					discriminator: user.discriminator,
					id: user.id,
					avatar: user.avatar,
					public_flags: user.public_flags,
				},
			});
		});

		return res.json(bansObj);
	},
);

router.get(
	"/:user_id",
	route({
		permission: "BAN_MEMBERS",
		responses: {
			200: {
				body: "BanModeratorSchema",
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
		const { guild_id, user_id } = req.params;

		const ban = (await Ban.findOneOrFail({
			where: { guild_id: guild_id, user_id: user_id },
		})) as BanRegistrySchema;

		if (ban.user_id === ban.executor_id) throw DiscordApiErrors.UNKNOWN_BAN;
		// pretend self-bans don't exist to prevent victim chasing

		const banInfo = {
			user: await User.getPublicUser(ban.user_id),
			reason: ban.reason,
		};

		return res.json(banInfo);
	},
);

router.put(
	"/:user_id",
	route({
		requestBody: "BanCreateSchema",
		permission: "BAN_MEMBERS",
		responses: {
			200: {
				body: "Ban",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const banned_user_id = req.params.user_id;

		if (
			req.user_id === banned_user_id &&
			banned_user_id === req.permission?.cache.guild?.owner_id
		)
			throw new HTTPError(
				"You are the guild owner, hence can't ban yourself",
				403,
			);

		if (req.permission?.cache.guild?.owner_id === banned_user_id)
			throw new HTTPError("You can't ban the owner", 400);

		const existingBan = await Ban.findOne({
			where: { guild_id: guild_id, user_id: banned_user_id },
		});
		// Bans on already banned users are silently ignored
		if (existingBan) return res.status(204).send();

		const banned_user = await User.getPublicUser(banned_user_id);

		const ban = Ban.create({
			user_id: banned_user_id,
			guild_id: guild_id,
			ip: getIpAdress(req),
			executor_id: req.user_id,
			reason: req.body.reason, // || otherwise empty
		});

		await Promise.all([
			Member.removeFromGuild(banned_user_id, guild_id),
			ban.save(),
			emitEvent({
				event: "GUILD_BAN_ADD",
				data: {
					guild_id: guild_id,
					user: banned_user,
				},
				guild_id: guild_id,
			} as GuildBanAddEvent),
		]);

		return res.status(204).send();
	},
);

router.delete(
	"/:user_id",
	route({
		permission: "BAN_MEMBERS",
		responses: {
			204: {},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id, user_id } = req.params;

		await Ban.findOneOrFail({
			where: { guild_id: guild_id, user_id: user_id },
		});

		const banned_user = await User.getPublicUser(user_id);

		await Promise.all([
			Ban.delete({
				user_id: user_id,
				guild_id,
			}),

			emitEvent({
				event: "GUILD_BAN_REMOVE",
				data: {
					guild_id,
					user: banned_user,
				},
				guild_id,
			} as GuildBanRemoveEvent),
		]);

		return res.status(204).send();
	},
);

export default router;
