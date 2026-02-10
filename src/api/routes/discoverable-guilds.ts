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

import { Config, Guild, Member } from "@spacebar/util";

import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { In, Like, Not } from "typeorm";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "DiscoverableGuildsResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { offset, limit, categories } = req.query;
        const showAllGuilds = Config.get().guild.discovery.showAllGuilds;
        const configLimit = Config.get().guild.discovery.limit;
        const hideJoinedGuilds = Config.get().guild.discovery.hideJoinedGuilds;
        const hiddenGuildIds = hideJoinedGuilds
            ? await Member.find({
                  where: { id: req.user_id },
                  select: { guild_id: true },
              }).then((members) => members.map((member) => member.guild_id))
            : [];

        const guilds = await Guild.find({
            where: {
                id: Not(In(hiddenGuildIds)),
                discovery_excluded: false,
                ...(categories == undefined ? {} : { primary_category_id: categories.toString() }), // TODO: isnt this an array?
                ...(showAllGuilds ? {} : { features: Like("%DISCOVERABLE%") }),
            },
            order: {
                discovery_weight: "DESC",
                member_count: "DESC",
            },
            skip: Math.abs(Number(offset || Config.get().guild.discovery.offset)),
            take: Math.abs(Number(limit || configLimit)),
        });

        const total = guilds ? guilds.length : undefined;

        res.send({
            total: total,
            guilds: guilds,
            offset: Number(offset || Config.get().guild.discovery.offset),
            limit: Number(limit || configLimit),
        });
    },
);

export default router;
