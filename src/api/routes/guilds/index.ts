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
	Config,
	DiscordApiErrors,
	Guild,
	Member,
	getRights,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { GuildCreateSchema } from "@spacebar/schemas"

const router: Router = Router({ mergeParams: true });

//TODO: create default channel

router.post(
	"/",
	route({
		requestBody: "GuildCreateSchema",
		right: "CREATE_GUILDS",
		responses: {
			201: {
				body: "GuildCreateResponse",
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
		const body = req.body as GuildCreateSchema;

		const { maxGuilds } = Config.get().limits.user;
		const guild_count = await Member.count({ where: { id: req.user_id } });
		const rights = await getRights(req.user_id);
		if (guild_count >= maxGuilds && !rights.has("MANAGE_GUILDS")) {
			throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
		}

		const guild = await Guild.createGuild({
			...body,
			owner_id: req.user_id,
			template_guild_id: null,
		});

		const { autoJoin } = Config.get().guild;
		if (autoJoin.enabled && !autoJoin.guilds?.length) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
		}

		await Member.addToGuild(req.user_id, guild.id);

		res.status(201).json(guild);
	},
);

export default router;
