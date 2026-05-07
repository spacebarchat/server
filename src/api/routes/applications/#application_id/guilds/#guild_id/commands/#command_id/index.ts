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
import { applicationCommandIdWhere, buildApplicationCommand, requireApplicationCommandManagement, route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { Application, ApplicationCommand, Guild, Member } from "@spacebar/util";

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
    const applicationExists = await Application.exists({ where: { id: req.params.application_id as string } });

    if (!applicationExists) {
        res.status(404).send({ code: 404, message: "Unknown application" });
        return;
    }

    const guildExists = await Guild.exists({ where: { id: req.params.guild_id as string } });

    if (!guildExists) {
        res.status(404).send({ code: 404, message: "Unknown Server" });
        return;
    }

    if (!(await Member.exists({ where: { id: req.params.application_id as string, guild_id: req.params.guild_id as string } }))) {
        res.status(401).send({ code: 401, message: "Missing Access" });
        return;
    }

    const command = await ApplicationCommand.findOne({
        where: applicationCommandIdWhere({ applicationId: req.params.application_id as string, guildId: req.params.guild_id as string }, req.params.command_id as string),
    });

    if (!command) {
        res.status(404).send({ code: 404, message: "Unknown application command" });
        return;
    }

    res.send(command);
});

router.patch(
    "/",
    route({
        requestBody: "ApplicationCommandCreateSchema",
    }),
    async (req: Request, res: Response) => {
        const scope = { applicationId: req.params.application_id as string, guildId: req.params.guild_id as string };
        await requireApplicationCommandManagement(scope.applicationId, req.user_id);

        const guildExists = await Guild.exists({ where: { id: scope.guildId } });

        if (!guildExists) {
            res.status(404).send({ code: 404, message: "Unknown Server" });
            return;
        }

        if (!(await Member.exists({ where: { id: scope.applicationId, guild_id: scope.guildId } }))) {
            res.status(401).send({ code: 401, message: "Missing Access" });
            return;
        }

        const body = req.body as ApplicationCommandCreateSchema;
        const commandForDb = buildApplicationCommand(scope, body);

        const where = applicationCommandIdWhere(scope, req.params.command_id as string);
        const commandExists = await ApplicationCommand.exists({ where });

        if (!commandExists) {
            res.status(404).send({ code: 404, message: "Unknown application command" });
            return;
        }

        await ApplicationCommand.update(where, commandForDb);
        res.send(commandForDb);
    },
);

router.delete("/", route({}), async (req: Request, res: Response) => {
    const scope = { applicationId: req.params.application_id as string, guildId: req.params.guild_id as string };
    await requireApplicationCommandManagement(scope.applicationId, req.user_id);

    const guildExists = await Guild.exists({ where: { id: scope.guildId } });

    if (!guildExists) {
        res.status(404).send({ code: 404, message: "Unknown Server" });
        return;
    }

    if (!(await Member.exists({ where: { id: scope.applicationId, guild_id: scope.guildId } }))) {
        res.status(401).send({ code: 401, message: "Missing Access" });
        return;
    }

    const where = applicationCommandIdWhere(scope, req.params.command_id as string);
    const commandExists = await ApplicationCommand.exists({ where });

    if (!commandExists) {
        res.status(404).send({ code: 404, message: "Unknown application command" });
        return;
    }

    await ApplicationCommand.delete(where);
    res.sendStatus(204);
});

export default router;
