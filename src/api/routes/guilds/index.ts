/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { Router, Request, Response } from "express";
import {
	Guild,
	Config,
	getRights,
	Member,
	DiscordApiErrors,
	GuildCreateSchema,
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

//TODO: create default channel

router.post(
	"/",
	route({ body: "GuildCreateSchema", right: "CREATE_GUILDS" }),
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
		});

		const { autoJoin } = Config.get().guild;
		if (autoJoin.enabled && !autoJoin.guilds?.length) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
		}

		await Member.addToGuild(req.user_id, guild.id);

		res.status(201).json({ id: guild.id });
	},
);

export default router;
