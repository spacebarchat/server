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

import { getIpAdress, route, verifyCaptcha } from "@fosscord/api";
import {
	checkToken,
	Config,
	FieldErrors,
	generateToken,
	User,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
const router = Router();

async function getToken(user: User) {
	const token = await generateToken(user.id);

	// Notice this will have a different token structure, than discord
	// Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
	// https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png

	return { token };
}

// TODO: the response interface also returns settings, but this route doesn't actually return that.
router.post(
	"/",
	route({
		body: "VerifyEmailSchema",
		responses: {
			200: {
				body: "TokenResponse",
			},
			400: {
				body: "APIErrorOrCaptchaResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { captcha_key, token } = req.body;

		const config = Config.get();

		if (config.register.requireCaptcha && config.security.captcha.enabled) {
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

		const { jwtSecret } = Config.get().security;
		let user;

		try {
			const userTokenData = await checkToken(token, jwtSecret, true);
			user = userTokenData.user;
		} catch {
			throw FieldErrors({
				password: {
					message: req.t("auth:password_reset.INVALID_TOKEN"),
					code: "INVALID_TOKEN",
				},
			});
		}

		if (user.verified) return res.json(await getToken(user));

		await User.update({ id: user.id }, { verified: true });

		return res.json(await getToken(user));
	},
);

export default router;
