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
	Ban,
	DiscordApiErrors,
	GuildBanAddEvent,
	Member,
	User,
	emitEvent, getIpAdress,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { Config } from "@spacebar/util";

const router: Router = Router();

router.post(
	"/",
	route({
		requestBody: "BulkBanSchema",
		permission: ["BAN_MEMBERS", "MANAGE_GUILD"],
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

		const userIds: Array<string> = req.body.user_ids;
		if (!userIds) throw new HTTPError("The user_ids array is missing", 400);

		if (userIds.length > Config.get().limits.guild.maxBulkBanUsers)
			throw new HTTPError(
				"The user_ids array must be between 1 and 200 in length",
				400,
			);

		const banned_users = [];
		const failed_users = [];
		for await (const banned_user_id of userIds) {
			if (
				req.user_id === banned_user_id &&
				banned_user_id === req.permission?.cache.guild?.owner_id
			) {
				failed_users.push(banned_user_id);
				continue;
			}

			if (req.permission?.cache.guild?.owner_id === banned_user_id) {
				failed_users.push(banned_user_id);
				continue;
			}

			const existingBan = await Ban.findOne({
				where: { guild_id: guild_id, user_id: banned_user_id },
			});
			if (existingBan) {
				failed_users.push(banned_user_id);
				continue;
			}

			let banned_user;
			try {
				banned_user = await User.getPublicUser(banned_user_id);
			} catch {
				failed_users.push(banned_user_id);
				continue;
			}

			const ban = Ban.create({
				user_id: banned_user_id,
				guild_id: guild_id,
				ip: getIpAdress(req),
				executor_id: req.user_id,
				reason: req.body.reason, // || otherwise empty
			});

			try {
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
				banned_users.push(banned_user_id);
			} catch {
				failed_users.push(banned_user_id);
				continue;
			}
		}

		if (banned_users.length === 0 && failed_users.length > 0)
			throw DiscordApiErrors.BULK_BAN_FAILED;
		return res.json({
			banned_users: banned_users,
			failed_users: failed_users,
		});
	},
);

export default router;
