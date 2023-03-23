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

import { getIpAdress, route, verifyCaptcha } from "@spacebar/api";
import {
	Config,
	Email,
	FieldErrors,
	ForgotPasswordSchema,
	User,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({
		body: "ForgotPasswordSchema",
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
			},
			500: {
				body: "APIErrorResponse",
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

		const user = await User.findOneOrFail({
			where: [{ phone: login }, { email: login }],
			select: ["username", "id", "disabled", "deleted", "email"],
			relations: ["security_keys"],
		}).catch(() => {
			throw FieldErrors({
				login: {
					message: req.t("auth:password_reset.EMAIL_DOES_NOT_EXIST"),
					code: "EMAIL_DOES_NOT_EXIST",
				},
			});
		});

		if (!user.email)
			throw FieldErrors({
				login: {
					message:
						"This account does not have an email address associated with it.",
					code: "NO_EMAIL",
				},
			});

		if (user.deleted)
			return res.status(400).json({
				message: "This account is scheduled for deletion.",
				code: 20011,
			});

		if (user.disabled)
			return res.status(400).json({
				message: req.t("auth:login.ACCOUNT_DISABLED"),
				code: 20013,
			});

		return await Email.sendResetPassword(user, user.email)
			.then(() => {
				return res.sendStatus(204);
			})
			.catch((e) => {
				console.error(
					`Failed to send password reset email to ${user.username}#${user.discriminator}: ${e}`,
				);
				throw new HTTPError("Failed to send password reset email", 500);
			});
	},
);

export default router;
