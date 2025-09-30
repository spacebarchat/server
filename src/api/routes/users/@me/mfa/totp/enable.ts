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
	TotpEnableSchema,
	User,
	generateMfaBackupCodes,
	generateToken,
} from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";

const router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		requestBody: "TotpEnableSchema",
		responses: {
			200: {
				body: "TokenWithBackupCodesResponse",
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
		const body = req.body as TotpEnableSchema;

		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: ["data", "email"],
		});

		// TODO: Are guests allowed to enable 2fa?
		if (user.data.hash) {
			if (!(await bcrypt.compare(body.password, user.data.hash))) {
				throw new HTTPError(req.t("auth:login.INVALID_PASSWORD"));
			}
		}

		if (!body.secret)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_SECRET"), 60005);

		if (!body.code)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

		if (verifyToken(body.secret, body.code)?.delta != 0)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

		const backup_codes = generateMfaBackupCodes(req.user_id);
		await Promise.all(backup_codes.map((x) => x.save()));
		await User.update(
			{ id: req.user_id },
			{ mfa_enabled: true, totp_secret: body.secret },
		);

		res.send({
			token: await generateToken(user.id),
			backup_codes: backup_codes.map((x) => ({
				...x,
				expired: undefined,
			})),
		});
	},
);

export default router;
