/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { route } from "@fosscord/api";
import { User } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get(
	"/",
	route({
		responses: {
			200: { body: "UserRelationsResponse" },
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const mutual_relations: object[] = [];
		const requested_relations = await User.findOneOrFail({
			where: { id: req.params.id },
			relations: ["relationships"],
		});
		const self_relations = await User.findOneOrFail({
			where: { id: req.user_id },
			relations: ["relationships"],
		});

		for (const rmem of requested_relations.relationships) {
			for (const smem of self_relations.relationships)
				if (
					rmem.to_id === smem.to_id &&
					rmem.type === 1 &&
					rmem.to_id !== req.user_id
				) {
					const relation_user = await User.getPublicUser(rmem.to_id);

					mutual_relations.push({
						id: relation_user.id,
						username: relation_user.username,
						avatar: relation_user.avatar,
						discriminator: relation_user.discriminator,
						public_flags: relation_user.public_flags,
					});
				}
		}

		res.json(mutual_relations);
	},
);

export default router;
