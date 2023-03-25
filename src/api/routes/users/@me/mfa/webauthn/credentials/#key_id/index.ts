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
import { SecurityKey, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
const router = Router();

router.delete(
	"/",
	route({
		responses: {
			204: {},
		},
	}),
	async (req: Request, res: Response) => {
		const { key_id } = req.params;

		await SecurityKey.delete({
			id: key_id,
			user_id: req.user_id,
		});

		const keys = await SecurityKey.count({
			where: { user_id: req.user_id },
		});

		// disable webauthn if there are no keys left
		if (keys === 0)
			await User.update({ id: req.user_id }, { webauthn_enabled: false });

		res.sendStatus(204);
	},
);

export default router;
