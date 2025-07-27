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

import { route, verifyCaptcha } from "@spacebar/api";
import { Config, Email, ForgotPasswordSchema, getIpAdress, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.post(
	"/",
	route({
		requestBody: "ForgotPasswordSchema",
		responses: {
			204: {},
			400: {
				body: "APIErrorOrCaptchaResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { login, captcha_key } = req.body as ForgotPasswordSchema;

		const config = Config.get();

		if (
			config.passwordReset.requireCaptcha &&
			config.security.captcha.enabled
		) {
			const { sitekey, service } = config.security.captcha;
			if (!captcha_key) {
				return res.status(400).json({
					captcha_key: ["captcha-required"],
					captcha_sitekey: sitekey,
					captcha_service: service,
				});
			}

			const ip = getIpAdress(req);
			const verify = await verifyCaptcha(captcha_key, ip);
			if (!verify.success) {
				return res.status(400).json({
					captcha_key: verify["error-codes"],
					captcha_sitekey: sitekey,
					captcha_service: service,
				});
			}
		}

		res.sendStatus(204);

		const user = await User.findOne({
			where: [{ phone: login }, { email: login }],
			select: ["username", "id", "email"],
		}).catch(() => {});

		if (user && user.email) {
			Email.sendResetPassword(user, user.email).catch((e) => {
				console.error(
					`Failed to send password reset email to ${user.username}#${user.discriminator} (${user.id}): ${e}`,
				);
			});
		}
	},
);

export default router;
