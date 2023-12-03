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
import { AdminUserProjection, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { ILike, MoreThan } from "typeorm";
const router = Router();

router.get(
	"/",
	route({
		right: "MANAGE_USERS",
		description: "Get a list of users",
		query: {
			limit: {
				description: "The maximum amount of users to return",
				type: "number",
				required: false,
			},
			after: {
				description: "The amount of users to skip",
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
				body: "UsersAdminResponse",
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

		const users = await User.find({
			where: {
				...(after ? { id: MoreThan(`${after}`) } : {}),
				...(query ? { username: ILike(`%${query}%`) } : {}),
			},
			take: limit,
			select: AdminUserProjection,
			order: { id: "ASC" },
		});

		res.send(users);
	},
);

export default router;
