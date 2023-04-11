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
import { Role, Member } from "@spacebar/util";
import { route } from "@spacebar/api";
import {} from "typeorm";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const role_ids = await Role.find({ where: { guild_id }, select: ["id"] });
	const counts: { [id: string]: number } = {};
	for (const { id } of role_ids) {
		counts[id] = await Member.count({ where: { roles: { id }, guild_id } });
	}

	return res.json(counts);
});

export default router;
