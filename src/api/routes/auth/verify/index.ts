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

import { route, verifyCaptcha } from "@fosscord/api";
import {
	Config,
	FieldErrors,
	verifyTokenEmailVerification,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({ body: "VerifyEmailSchema" }),
	async (req: Request, res: Response) => {
		const { captcha_key, token } = req.body;

		if (captcha_key) {
			const { sitekey, service } = Config.get().security.captcha;
			const verify = await verifyCaptcha(captcha_key);
			if (!verify.success) {
				return res.status(400).json({
					captcha_key: verify["error-codes"],
					captcha_sitekey: sitekey,
					captcha_service: service,
				});
			}
		}

		try {
			const { jwtSecret } = Config.get().security;

			const { decoded, user } = await verifyTokenEmailVerification(
				token,
				jwtSecret,
			);

			// toksn should last for 24 hours from the time they were issued
			if (new Date().getTime() > decoded.iat * 1000 + 86400 * 1000) {
				throw FieldErrors({
					token: {
						code: "TOKEN_INVALID",
						message: "Invalid token", // TODO: add translation
					},
				});
			}

			if (user.verified) return res.send(user);

			// verify email
			user.verified = true;
			await user.save();

			// TODO: invalidate token after use?

			return res.send(user);
		} catch (error: any) {
			throw new HTTPError(error?.toString(), 400);
		}
	},
);

export default router;
