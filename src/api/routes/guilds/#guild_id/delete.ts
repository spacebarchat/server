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
import { Guild, GuildDeleteEvent, emitEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router({ mergeParams: true });

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post(
    "/",
    route({
        responses: {
            204: {},
            401: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params;

        const guild = await Guild.findOneOrFail({
            where: { id: guild_id },
            select: ["owner_id"],
        });
        if (guild.owner_id !== req.user_id) throw new HTTPError("You are not the owner of this guild", 401);

        await Promise.all([
            Guild.delete({ id: guild_id }), // this will also delete all guild related data
            emitEvent({
                event: "GUILD_DELETE",
                data: {
                    id: guild_id,
                },
                guild_id: guild_id,
            } as GuildDeleteEvent),
        ]);

        return res.sendStatus(204);
    },
);

export default router;
