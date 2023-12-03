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
import { Ban } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { MoreThan } from "typeorm";
const router = Router();

router.get(
	"/",
	route({
		description: "Get bans of a guild",
		right: "ADMIN_READ_GUILD_BANS",
		query: {
			limit: {
				type: "number",
				description:
					"max number of bans to return (1-1000). default 100",
			},
			after: {
				type: "string",
			},
		},
		responses: {
			200: {
				body: "GuildBansResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const { after } = req.query as {
			after?: string;
		};
		const limit = Number(req.query.limit) || 100;
		if (limit > 1000 || limit < 1)
			throw new HTTPError("Limit must be between 1 and 1000");

		const bans = await Ban.find({
			where: { guild_id, ...(after ? { id: MoreThan(after) } : {}) },
			order: { id: "ASC" },
			take: limit,
		});

		return res.json(bans);
	},
);

export default router;
