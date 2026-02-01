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
import { Application, ApplicationCommand, FieldErrors, Snowflake } from "@spacebar/util";

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
    const applicationExists = await Application.exists({ where: { id: req.params.application_id as string } });

    if (!applicationExists) {
        res.status(404).send({ code: 404, message: "Unknown application" });
        return;
    }

    const command = await ApplicationCommand.findOne({ where: { application_id: req.params.application_id as string, id: req.params.command_id as string } });

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
        const applicationExists = await Application.exists({ where: { id: req.params.application_id as string } });

        if (!applicationExists) {
            res.status(404).send({ code: 404, message: "Unknown application" });
            return;
        }

        const commandExists = await ApplicationCommand.exists({ where: { application_id: req.params.application_id as string, id: req.params.command_id as string } });

        if (!commandExists) {
            res.status(404).send({ code: 404, message: "Unknown application command" });
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
            application_id: req.params.application_id as string,
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

        await ApplicationCommand.update({ name: body.name.trim() }, commandForDb);
        res.send(commandForDb);
    },
);

router.delete("/", async (req: Request, res: Response) => {
    const applicationExists = await Application.exists({ where: { id: req.params.application_id as string } });

    if (!applicationExists) {
        res.status(404).send({ code: 404, message: "Unknown application" });
        return;
    }

    const commandExists = await ApplicationCommand.exists({ where: { application_id: req.params.application_id as string, id: req.params.command_id as string } });

    if (!commandExists) {
        res.status(404).send({ code: 404, message: "Unknown application command" });
        return;
    }

    await ApplicationCommand.delete({ application_id: req.params.application_id as string, id: req.params.command_id as string });
    res.sendStatus(204);
});

export default router;
