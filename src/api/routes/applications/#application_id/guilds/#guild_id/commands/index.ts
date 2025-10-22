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

import { ApplicationCommandCreateSchema, ApplicationCommandSchema } from "@spacebar/schemas";
import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { Application, ApplicationCommand, FieldErrors, Guild, Member, Snowflake } from "@spacebar/util";

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
	const applicationExists = await Application.exists({ where: { id: req.params.application_id } });

	if (!applicationExists) {
		res.status(404).send({ code: 404, message: "Unknown application" });
		return;
	}

	const guildExists = await Guild.exists({ where: { id: req.params.guild_id } });

	if (!guildExists) {
		res.status(404).send({ code: 404, message: "Unknown Server" });
		return;
	}

	if (!(await Member.exists({ where: { id: req.params.application_id, guild_id: req.params.guild_id } }))) {
		res.status(401).send({ code: 401, message: "Missing Access" });
		return;
	}

	const command = await ApplicationCommand.find({ where: { application_id: req.params.application_id, guild_id: req.params.guild_id } });
	res.send(command);
});

router.post(
	"/",
	route({
		requestBody: "ApplicationCommandCreateSchema",
	}),
	async (req: Request, res: Response) => {
		const applicationExists = await Application.exists({ where: { id: req.params.application_id } });

		if (!applicationExists) {
			res.status(404).send({ code: 404, message: "Unknown application" });
			return;
		}

		const guildExists = await Guild.exists({ where: { id: req.params.guild_id } });

		if (!guildExists) {
			res.status(404).send({ code: 404, message: "Unknown Server" });
			return;
		}

		if (!(await Member.exists({ where: { id: req.params.application_id, guild_id: req.params.guild_id } }))) {
			res.status(401).send({ code: 401, message: "Missing Access" });
			return;
		}

		const body = req.body as ApplicationCommandCreateSchema;

		if (!body.type) {
			body.type = 1;
		}

		if (body.name.trim().length < 1 || body.name.trim().length > 32) {
			// TODO: configurable?
			throw FieldErrors({
				name: {
					code: "BASE_TYPE_BAD_LENGTH",
					message: `Must be between 1 and 32 in length.`,
				},
			});
		}

		const commandForDb: ApplicationCommandSchema = {
			application_id: req.params.application_id,
			guild_id: req.params.guild_id,
			name: body.name.trim(),
			name_localizations: body.name_localizations,
			description: body.description?.trim() || "",
			description_localizations: body.description_localizations,
			default_member_permissions: body.default_member_permissions || null,
			contexts: body.contexts,
			dm_permission: body.dm_permission || true,
			global_popularity_rank: 1,
			handler: body.handler,
			integration_types: body.integration_types,
			nsfw: body.nsfw,
			options: body.options,
			type: body.type,
			version: Snowflake.generate(),
		};

		const commandExists = await ApplicationCommand.exists({ where: { application_id: req.params.application_id, guild_id: req.params.guild_id, name: body.name.trim() } });

		if (commandExists) {
			await ApplicationCommand.update({ application_id: req.params.application_id, guild_id: req.params.guild_id, name: body.name.trim() }, commandForDb);
		} else {
			commandForDb.id = Snowflake.generate(); // Have to be done that way so the id doesn't change
			await ApplicationCommand.save(commandForDb);
		}

		res.send(body);
	},
);

router.put(
	"/",
	route({
		requestBody: "BulkApplicationCommandCreateSchema",
	}),
	async (req: Request, res: Response) => {
		const applicationExists = await Application.exists({ where: { id: req.params.application_id } });

		if (!applicationExists) {
			res.status(404).send({ code: 404, message: "Unknown application" });
			return;
		}

		const guildExists = await Guild.exists({ where: { id: req.params.guild_id } });

		if (!guildExists) {
			res.status(404).send({ code: 404, message: "Unknown Server" });
			return;
		}

		if (!(await Member.exists({ where: { id: req.params.application_id, guild_id: req.params.guild_id } }))) {
			res.status(401).send({ code: 401, message: "Missing Access" });
			return;
		}

		const body = req.body as ApplicationCommandCreateSchema[];

		// Remove commands not present in array
		const applicationCommands = await ApplicationCommand.find({ where: { application_id: req.params.application_id, guild_id: req.params.guild_id } });

		const commandNamesInArray = body.map((c) => c.name);
		const commandsNotInArray = applicationCommands.filter((c) => !commandNamesInArray.includes(c.name));

		for (const command of commandsNotInArray) {
			await ApplicationCommand.delete({ application_id: req.params.application_id, guild_id: req.params.guild_id, id: command.id });
		}

		for (const command of body) {
			if (!command.type) {
				command.type = 1;
			}

			if (command.name.trim().length < 1 || command.name.trim().length > 32) {
				// TODO: configurable?
				throw FieldErrors({
					name: {
						code: "BASE_TYPE_BAD_LENGTH",
						message: `Must be between 1 and 32 in length.`,
					},
				});
			}

			const commandForDb: ApplicationCommandSchema = {
				application_id: req.params.application_id,
				guild_id: req.params.guild_id,
				name: command.name.trim(),
				name_localizations: command.name_localizations,
				description: command.description?.trim() || "",
				description_localizations: command.description_localizations,
				default_member_permissions: command.default_member_permissions || null,
				contexts: command.contexts,
				dm_permission: command.dm_permission || true,
				global_popularity_rank: 1,
				handler: command.handler,
				integration_types: command.integration_types,
				nsfw: command.nsfw,
				options: command.options,
				type: command.type,
				version: Snowflake.generate(),
			};

			const commandExists = await ApplicationCommand.exists({ where: { application_id: req.params.application_id, guild_id: req.params.guild_id, name: command.name } });

			if (commandExists) {
				await ApplicationCommand.update({ application_id: req.params.application_id, guild_id: req.params.guild_id, name: command.name }, commandForDb);
			} else {
				commandForDb.id = Snowflake.generate(); // Have to be done that way so the id doesn't change
				await ApplicationCommand.save(commandForDb);
			}
		}

		res.send(body);
	},
);

export default router;
