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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/middlewares";
import { Sticker } from "@spacebar/database";
import { Config } from "@spacebar/util";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "Sticker",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { sticker_id } = req.params as { [key: string]: string };

        res.json(await Sticker.findOne({ where: { id: sticker_id } }));
    },
);
router.get(
    "/guild",
    route({
        responses: {
            200: {
                body: "Sticker",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { sticker_id } = req.params as { [key: string]: string };
        const sticker = await Sticker.findOne({ where: { id: sticker_id }, relations: { guild: true } });

        const showAllGuilds = Config.get().guild.discovery.showAllGuilds;
        const guild = sticker?.guild;

        if (guild) {
        res.json(showAllGuilds || guild.features.includes("DISCOVERABLE") ? await guild?.toDiscoverableGuild() : null);
    }},
);

export default router;
