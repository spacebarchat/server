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

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
	const members = await Member.find({ where: { guild_id: req.params.guild_id, user: { bot: true } } });

	const applications = await Application.find({ where: { id: members[0].id } });
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

	const globalApplicationCommands = await ApplicationCommand.find({ where: { application_id: applications[0].id, guild_id: IsNull() } });
	const guildApplicationCommands = await ApplicationCommand.find({ where: { application_id: applications[0].id, guild_id: req.params.guild_id } });

	const applicationCommandsSendable = [];

	for (const command of [...globalApplicationCommands, ...guildApplicationCommands]) {
		applicationCommandsSendable.push({
			application_id: command.application_id,
			description: command.description,
			dm_permission: command.dm_permission,
			global_popularity_rank: command.global_popularity_rank,
			id: command.id,
			integration_types: command.integration_types,
			name: command.name,
			type: command.type,
			version: command.version,
		});
	}

	res.send({
		applications: applicationsSendable,
		application_commands: applicationCommandsSendable,
		version: Snowflake.generate(),
	});
});

export default router;
