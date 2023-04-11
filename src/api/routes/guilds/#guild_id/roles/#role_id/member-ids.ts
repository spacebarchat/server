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

import { Router, Request, Response } from "express";
import { Member } from "@spacebar/util";
import { route } from "@spacebar/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id, role_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);
	const members = await Member.find({
		select: ["id"],
		relations: ["roles"],
	});
	const member_ids = members
		.filter((member) => {
			return member.roles.map((role) => role.id).includes(role_id);
		})
		.map((member) => member.id);
	return res.json(member_ids);
});

export default router;
