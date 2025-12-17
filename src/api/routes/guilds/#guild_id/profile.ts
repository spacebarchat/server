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
import { Guild } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { GuildProfileResponse, GuildVisibilityLevel } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            "200": {
                body: "GuildProfileResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params;
        const guild = await Guild.findOneOrFail({ where: { id: guild_id } });
        const profileResponse: GuildProfileResponse = {
            id: guild_id,
            name: guild.name,
            icon_hash: guild.icon ?? null,
            member_count: guild.member_count!,
            online_count: guild.member_count!,
            description: guild.description ?? "A Spacebar guild",
            brand_color_primary: "#FF00FF",
            banner_hash: null,
            game_application_ids: [], // We don't track this
            game_activity: {}, // We don't track this
            tag: guild.name.substring(0, 4).toUpperCase(), // TODO: allow custom tags
            badge: 0,
            badge_color_primary: "#FF00FF",
            badge_color_secondary: "#00FFFF",
            badge_hash: "",
            traits: [],
            features: guild.features ?? [],
            visibility: GuildVisibilityLevel.PUBLIC,
            custom_banner_hash: guild.banner ?? null,
            premium_subscription_count: guild.premium_subscription_count ?? 0,
            premium_tier: guild.premium_tier ?? 0,
        };

        res.send(profileResponse);
    },
);

export default router;
