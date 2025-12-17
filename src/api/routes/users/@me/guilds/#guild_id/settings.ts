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
import { Channel, Member, OrmUtils } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { UserGuildSettingsSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

// GET doesn't exist on discord.com
router.get(
    "/",
    route({
        responses: {
            200: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const user = await Member.findOneOrFail({
            where: { id: req.user_id, guild_id: req.params.guild_id },
            select: ["settings"],
        });
        return res.json(user.settings);
    },
);

router.patch(
    "/",
    route({
        requestBody: "UserGuildSettingsSchema",
        responses: {
            200: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const body = req.body as UserGuildSettingsSchema;

        if (body.channel_overrides) {
            for (const channel in body.channel_overrides) {
                Channel.findOneOrFail({ where: { id: channel } });
            }
        }

        const user = await Member.findOneOrFail({
            where: { id: req.user_id, guild_id: req.params.guild_id },
            select: ["settings"],
        });
        OrmUtils.mergeDeep(user.settings || {}, body);
        Member.update({ id: req.user_id, guild_id: req.params.guild_id }, user);

        res.json(user.settings);
    },
);

export default router;
