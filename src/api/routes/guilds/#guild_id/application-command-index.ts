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
import { Request, Response, Router } from "express";
import { Application, ApplicationCommand, Member, Snowflake } from "@spacebar/util";
import { IsNull } from "typeorm";
import { ApplicationCommandSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
	const members = await Member.find({ where: { guild_id: req.params.guild_id, user: { bot: true } } });
	const applications: Application[] = [];

	for (const member of members) {
		const app = await Application.findOne({ where: { id: member.id } });
		if (app) applications.push(app);
	}

	const applicationsSendable = [];

	for (const application of applications) {
		applicationsSendable.push({
			bot_id: application.bot?.id,
			description: application.description,
			flags: application.flags,
			icon: application.icon,
			id: application.id,
			name: application.name,
		});
	}

	const applicationCommands: ApplicationCommand[][] = [];

	for (const application of applications) {
		applicationCommands.push(await ApplicationCommand.find({ where: { application_id: application.id, guild_id: IsNull() } }));
		applicationCommands.push(await ApplicationCommand.find({ where: { application_id: application.id, guild_id: req.params.guild_id } }));
	}

	const applicationCommandsSendable: ApplicationCommandSchema[] = [];

	for (const command of applicationCommands.flat()) {
		applicationCommandsSendable.push({
			id: command.id,
			type: command.type,
			application_id: command.application_id,
			guild_id: command.guild_id,
			name: command.name,
			name_localizations: command.name_localizations,
			// name_localized: // TODO: make this work
			description: command.description,
			description_localizations: command.description_localizations,
			// description_localized: // TODO: make this work
			options: command.options,
			default_member_permissions: command.default_member_permissions,
			dm_permission: command.dm_permission,
			permissions: command.permissions,
			nsfw: command.nsfw,
			integration_types: command.integration_types,
			global_popularity_rank: command.global_popularity_rank,
			contexts: command.contexts,
			version: command.version,
			handler: command.handler,
		});
	}

	res.send({
		applications: applicationsSendable,
		application_commands: applicationCommandsSendable,
		version: Snowflake.generate(),
	});
});

export default router;
