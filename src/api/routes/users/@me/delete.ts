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
import { Member, User } from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

router.post(
	"/",
	route({
		responses: {
			204: {},
			401: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: ["data"],
		}); //User object
		let correctpass = true;

		if (user.data.hash) {
			// guest accounts can delete accounts without password
			correctpass = await bcrypt.compare(
				req.body.password,
				user.data.hash,
			);
			if (!correctpass) {
				throw new HTTPError(req.t("auth:login.INVALID_PASSWORD"));
			}
		}

		// TODO: decrement guild member count

		if (correctpass) {
			await Promise.all([
				User.delete({ id: req.user_id }),
				Member.delete({ id: req.user_id }),
			]);

			res.sendStatus(204);
		} else {
			res.sendStatus(401);
		}
	},
);

export default router;
