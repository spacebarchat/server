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

import { getPermission, Member } from "@fosscord/util";
import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.delete(
	"/",
	route({ permission: "MANAGE_ROLES" }),
	async (req: Request, res: Response) => {
		const { guild_id, role_id, member_id } = req.params;

		await Member.removeRole(member_id, guild_id, role_id);
		res.sendStatus(204);
	},
);

router.put(
	"/",
	route({ permission: "MANAGE_ROLES" }),
	async (req: Request, res: Response) => {
		const { guild_id, role_id, member_id } = req.params;

		await Member.addRole(member_id, guild_id, role_id);
		res.sendStatus(204);
	},
);

export default router;
