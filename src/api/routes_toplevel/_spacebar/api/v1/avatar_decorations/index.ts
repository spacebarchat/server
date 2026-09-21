/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors
	
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

import { Router, Response, Request } from "express";
import { Raw } from "typeorm";
import { route } from "@spacebar/api/middlewares";
import { AvatarDecorations, Member } from "@spacebar/database";
import { PublicAvatarDecorationListResponse } from "@spacebar/schemas/api/spacebar/AvatarDecorations";
import { arrayDistinctBy } from "@spacebar/extensions";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        spacebarOnly: true,
        description: "Get available avatar decorations",
        responses: {
            200: {
                body: "PublicAvatarDecorationListResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const memberships = await Member.find({ select: { guild_id: true, roles: { id: true } }, relations: { roles: true }, where: { id: req.user_id } });

        const decos = (
            await AvatarDecorations.find({
                where: [
                    { approved: true, public: true },
                    { approved: true, uploader_id: req.user_id },
                    { approved: true, allowed_user_ids: Raw((columnAlias) => `${columnAlias} && ARRAY[:req_uid]::int8[]`, { req_uid: req.user_id }) },
                    { approved: true, allowed_guild_ids: Raw((columnAlias) => `${columnAlias} && :guild_ids`, { guild_ids: memberships.map((x) => x.guild_id) }) },
                    { approved: true, allowed_role_ids: Raw((columnAlias) => `${columnAlias} && :role_ids`, { role_ids: memberships.flatMap((x) => x.roles.map((r) => r.id)) }) },
                ],
                relations: {
                    uploader: true,
                },
                order: {
                    id: "DESC",
                },
            })
        ).map((x) => x.toPublicAvatarDecoration({ available: true }));

        res.json(arrayDistinctBy(decos, (d) => d.id) satisfies PublicAvatarDecorationListResponse);
    },
);

export default router;
