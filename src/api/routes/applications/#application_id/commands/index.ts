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

import { ApplicationCommandCreateSchema } from "@spacebar/schemas";
import {
    applicationCommandIdWhere,
    applicationCommandNameWhere,
    applicationCommandScopeWhere,
    buildApplicationCommand,
    normalizeApplicationCommandName,
    requireApplicationCommandManagement,
    route,
} from "@spacebar/api";
import { Request, Response, Router } from "express";
import { Application, ApplicationCommand, Snowflake } from "@spacebar/util";

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
    const applicationExists = await Application.exists({ where: { id: req.params.application_id as string } });

    if (!applicationExists) {
        res.status(404).send({ code: 404, message: "Unknown application" });
        return;
    }

    const command = await ApplicationCommand.find({ where: applicationCommandScopeWhere({ applicationId: req.params.application_id as string }) });
    res.send(command);
});

router.post(
    "/",
    route({
        requestBody: "ApplicationCommandCreateSchema",
    }),
    async (req: Request, res: Response) => {
        const scope = { applicationId: req.params.application_id as string };
        await requireApplicationCommandManagement(scope.applicationId, req.user_id);

        const body = req.body as ApplicationCommandCreateSchema;

        const commandForDb = buildApplicationCommand(scope, body);
        const where = applicationCommandNameWhere(scope, commandForDb.name);
        const commandExists = await ApplicationCommand.exists({ where });

        if (commandExists) {
            await ApplicationCommand.update(where, commandForDb);
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
        const scope = { applicationId: req.params.application_id as string };
        await requireApplicationCommandManagement(scope.applicationId, req.user_id);

        const body = req.body as ApplicationCommandCreateSchema[];
        const commandNamesInArray = body.map((c) => normalizeApplicationCommandName(c.name));

        // Remove commands not present in array
        const applicationCommands = await ApplicationCommand.find({ where: applicationCommandScopeWhere(scope) });
        const commandsNotInArray = applicationCommands.filter((c) => !commandNamesInArray.includes(c.name));

        for (const command of commandsNotInArray) {
            await ApplicationCommand.delete(applicationCommandIdWhere(scope, command.id));
        }

        for (const command of body) {
            const commandForDb = buildApplicationCommand(scope, command);
            const where = applicationCommandNameWhere(scope, commandForDb.name);
            const commandExists = await ApplicationCommand.exists({ where });

            if (commandExists) {
                await ApplicationCommand.update(where, commandForDb);
            } else {
                commandForDb.id = Snowflake.generate(); // Have to be done that way so the id doesn't change
                await ApplicationCommand.save(commandForDb);
            }
        }

        res.send(body);
    },
);

export default router;
