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

import { generateCode, route } from "@fosscord/api";
import { Guild, Template } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router: Router = Router();

const TemplateGuildProjection: (keyof Guild)[] = [
	"name",
	"description",
	"region",
	"verification_level",
	"default_message_notifications",
	"explicit_content_filter",
	"preferred_locale",
	"afk_timeout",
	"roles",
	// "channels",
	"afk_channel_id",
	"system_channel_id",
	"system_channel_flags",
	"icon",
];

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const templates = await Template.find({
		where: { source_guild_id: guild_id },
	});

	return res.json(templates);
});

router.post(
	"/",
	route({ requestBody: "TemplateCreateSchema", permission: "MANAGE_GUILD" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			select: TemplateGuildProjection,
		});
		const exists = await Template.findOne({
			where: { id: guild_id },
		});
		if (exists) throw new HTTPError("Template already exists", 400);

		const template = await Template.create({
			...req.body,
			code: generateCode(),
			creator_id: req.user_id,
			created_at: new Date(),
			updated_at: new Date(),
			source_guild_id: guild_id,
			serialized_source_guild: guild,
		}).save();

		res.json(template);
	},
);

router.delete(
	"/:code",
	route({ permission: "MANAGE_GUILD" }),
	async (req: Request, res: Response) => {
		const { code, guild_id } = req.params;

		const template = await Template.delete({
			code,
			source_guild_id: guild_id,
		});

		res.json(template);
	},
);

router.put(
	"/:code",
	route({ permission: "MANAGE_GUILD" }),
	async (req: Request, res: Response) => {
		const { code, guild_id } = req.params;
		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			select: TemplateGuildProjection,
		});

		const template = await Template.create({
			code,
			serialized_source_guild: guild,
		}).save();

		res.json(template);
	},
);

router.patch(
	"/:code",
	route({ requestBody: "TemplateModifySchema", permission: "MANAGE_GUILD" }),
	async (req: Request, res: Response) => {
		const { code, guild_id } = req.params;
		const { name, description } = req.body;

		const template = await Template.create({
			code,
			name: name,
			description: description,
			source_guild_id: guild_id,
		}).save();

		res.json(template);
	},
);

export default router;
