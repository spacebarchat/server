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
	Channel,
	Guild,
	Member,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { GuildUpdateWelcomeScreenSchema } from "@spacebar/schemas"

const router: Router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "GuildWelcomeScreen",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const guild_id = req.params.guild_id;

		const guild = await Guild.findOneOrFail({ where: { id: guild_id } });
		await Member.IsInGuildOrFail(req.user_id, guild_id);

		res.json(guild.welcome_screen);
	},
);

router.patch(
	"/",
	route({
		requestBody: "GuildUpdateWelcomeScreenSchema",
		permission: "MANAGE_GUILD",
		responses: {
			204: {},
			"4XX": {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const guild_id = req.params.guild_id;
		const body = req.body as GuildUpdateWelcomeScreenSchema;

		const guild = await Guild.findOneOrFail({ where: { id: guild_id } });

		if (body.enabled != undefined)
			guild.welcome_screen.enabled = body.enabled;

		if (body.description != undefined)
			guild.welcome_screen.description = body.description;

		if (body.welcome_channels != undefined) {
			// Ensure channels exist within the guild
			await Promise.all(
				body.welcome_channels?.map(({ channel_id }) =>
					Channel.findOneOrFail({
						where: { id: channel_id, guild_id },
						select: { id: true },
					}),
				) || [],
			);
			guild.welcome_screen.welcome_channels = body.welcome_channels;
		}

		await guild.save();

		res.status(200).json(guild.welcome_screen);
	},
);

export default router;
