/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
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

import { route } from "@fosscord/api";
import { Guild, GuildUpdateWelcomeScreenSchema, Member } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router: Router = Router();

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
			400: {
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

		if (!guild.welcome_screen.enabled)
			throw new HTTPError("Welcome screen disabled", 400);
		if (body.welcome_channels)
			guild.welcome_screen.welcome_channels = body.welcome_channels; // TODO: check if they exist and are valid
		if (body.description)
			guild.welcome_screen.description = body.description;
		if (body.enabled != null) guild.welcome_screen.enabled = body.enabled;

		await guild.save();

		res.sendStatus(204);
	},
);

export default router;
