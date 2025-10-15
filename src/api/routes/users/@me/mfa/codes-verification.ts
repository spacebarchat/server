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
	DiscordApiErrors,
	User,
	generateMfaBackupCodes,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { CodesVerificationSchema } from "@spacebar/schemas"

const router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		requestBody: "CodesVerificationSchema",
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
		// const { key, nonce, regenerate } = req.body as CodesVerificationSchema;
		const { regenerate } = req.body as CodesVerificationSchema;

		// TODO: We don't have email/etc etc, so can't send a verification code.
		// Once that's done, this route can verify `key`

		// const user = await User.findOneOrFail({ where: { id: req.user_id } });
		if ((await User.count({ where: { id: req.user_id } })) === 0)
			throw DiscordApiErrors.UNKNOWN_USER;

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
