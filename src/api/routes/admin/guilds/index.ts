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
import { AdminGuildProjection, Guild } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { ILike, MoreThan } from "typeorm";
const router = Router();

router.get(
	"/",
	route({
		description: "Get a list of guilds",
		right: "MANAGE_GUILDS",
		query: {
			limit: {
				description:
					"max number of guilds to return (1-1000). default 100",
				type: "number",
				required: false,
			},
			after: {
				description: "The amount of guilds to skip",
				type: "number",
				required: false,
			},
			query: {
				description: "The search query",
				type: "string",
				required: false,
			},
		},
		responses: {
			200: {
				body: "GuildsAdminResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { after, query } = req.query as {
			after?: number;
			query?: string;
		};

		const limit = Number(req.query.limit) || 100;
		if (limit > 1000 || limit < 1)
			throw new HTTPError("Limit must be between 1 and 1000");

		const guilds = await Guild.find({
			where: {
				...(after ? { id: MoreThan(`${after}`) } : {}),
				...(query ? { name: ILike(`%${query}%`) } : {}),
			},
			take: limit,
			select: AdminGuildProjection,
		});

		res.send(guilds);
	},
);

export default router;
