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

import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server/HTTPError";
import { ILike } from "typeorm";
import { route } from "@spacebar/api/middlewares";
import { Member } from "@spacebar/database";
import { arrayDistinctBy } from "@spacebar/extensions";

const router = Router({ mergeParams: true });

// TODO: check for GUILD_MEMBERS intent

router.get(
    "/",
    route({
        query: {
            limit: {
                type: "number",
                description: "max number of members to return (1-1000). default 1",
                default: 1,
            },
            query: {
                type: "string",
            },
        },
        responses: {
            200: {
                body: "PublicMemberListResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params as { [key: string]: string };
        const limit = Number(req.query.limit) || 1;
        if (limit > 1000 || limit < 1) throw new HTTPError("Limit must be between 1 and 1000");
        const { query } = req.query as { [key: string]: string };

        await Member.IsInGuildOrFail(req.user_id, guild_id);

        const members = await Member.find({
            where: [
                { guild_id, nick: ILike(`%${query}%`) },
                { guild_id, user: { username: ILike(`%${query}%`) } },
            ],
            take: limit * 2, // because of dual query -> may produce duplicates
            order: { id: "ASC" },
            relations: {
                roles: true,
                user: true,
            },
        });

        return res.json(
            arrayDistinctBy(members, (m) => m.id)
                .slice(0, limit)
                .map((m) => m.toPublicMember()),
        );
    },
);

export default router;
