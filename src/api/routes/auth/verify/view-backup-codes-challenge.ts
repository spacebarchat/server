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
import { BackupCodesChallengeSchema, FieldErrors, User } from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
const router = Router();

router.post(
	"/",
	route({
		requestBody: "BackupCodesChallengeSchema",
		responses: {
			200: { body: "BackupCodesChallengeResponse" },
			400: { body: "APIErrorResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		const { password } = req.body as BackupCodesChallengeSchema;

		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: ["data"],
		});

		if (!(await bcrypt.compare(password, user.data.hash || ""))) {
			throw FieldErrors({
				password: {
					message: req.t("auth:login.INVALID_PASSWORD"),
					code: "INVALID_PASSWORD",
				},
			});
		}

		return res.json({
			nonce: "NoncePlaceholder",
			regenerate_nonce: "RegenNoncePlaceholder",
		});
	},
);

export default router;
