/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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
import { Config, DiscordApiErrors, Guild, GuildTemplateCreateSchema, Member, Template } from "@spacebar/util";
import { Request, Response, Router } from "express";
import fetch from "node-fetch-commonjs";
import { HTTPError } from "lambert-server";

const router: Router = Router({ mergeParams: true });

router.get(
	"/:code",
	route({
		responses: {
			200: {
				body: "Template",
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
		const { code } = req.params;

		const template = await getTemplate(code);

		res.json(template);
	},
);

router.post("/:code", route({ requestBody: "GuildTemplateCreateSchema" }), async (req: Request, res: Response) => {
	const { code } = req.params;
	const body = req.body as GuildTemplateCreateSchema;

	const { maxGuilds } = Config.get().limits.user;

	const guild_count = await Member.count({ where: { id: req.user_id } });
	if (guild_count >= maxGuilds) throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);

	const template = await getTemplate(code) as Template;

	const guild = await Guild.createGuild({
		...template.serialized_source_guild,
		// body comes after the template
		...body,
		owner_id: req.user_id,
		template_guild_id: template.source_guild_id,
	});

	await Member.addToGuild(req.user_id, guild.id);

	res.status(201).json({ id: guild.id });
});

async function getTemplate(code: string) {
	const { allowDiscordTemplates, allowRaws, enabled } = Config.get().templates;

	if (!enabled) throw new HTTPError("Template creation & usage is disabled on this instance.", 403);

	if (code.startsWith("discord:")) {
		if (!allowDiscordTemplates) throw new HTTPError("Discord templates cannot be used on this instance.", 403);

		const discordTemplateID = code.split("discord:", 2)[1];

		const discordTemplateData = await fetch(`https://discord.com/api/v9/guilds/templates/${discordTemplateID}`, {
			method: "get",
			headers: { "Content-Type": "application/json" },
		});

		return await discordTemplateData.json();
	}

	if (code.startsWith("external:")) {
		if (!allowRaws) throw new HTTPError("Importing raws is disabled on this instance.", 403);

		return code.split("external:", 2)[1];
	}

	return await Template.findOneOrFail({
		where: { code: code },
	});
}

export default router;
