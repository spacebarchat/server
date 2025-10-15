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
import {
	BackupCode,
	FieldErrors,
	generateMfaBackupCodes,
	User,
} from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { MfaCodesSchema } from "@spacebar/schemas"

const router = Router({ mergeParams: true });

// TODO: This route is replaced with users/@me/mfa/codes-verification in newer clients

router.post(
	"/",
	route({
		requestBody: "MfaCodesSchema",
		deprecated: true,
		description:
			"This route is replaced with users/@me/mfa/codes-verification in newer clients",
		responses: {
			200: {
				body: "APIBackupCodeArray",
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
		const { password, regenerate } = req.body as MfaCodesSchema;

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

		let codes: BackupCode[];
		if (regenerate) {
			await BackupCode.update(
				{ user: { id: req.user_id } },
				{ expired: true },
			);

			codes = generateMfaBackupCodes(req.user_id);
			await Promise.all(codes.map((x) => x.save()));
		} else {
			codes = await BackupCode.find({
				where: {
					user: {
						id: req.user_id,
					},
					expired: false,
				},
			});
		}

		return res.json({
			backup_codes: codes.map((x) => ({ ...x, expired: undefined })),
		});
	},
);

export default router;
