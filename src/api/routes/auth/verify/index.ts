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
import { checkToken, Config, generateToken, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

async function getToken(user: User) {
	const token = await generateToken(user.id);

	// Notice this will have a different token structure, than discord
	// Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
	// https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png

	return { token };
}

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

			const { user } = await checkToken(token, jwtSecret, true);

			if (user.verified) return res.json(await getToken(user));

			await User.update({ id: user.id }, { verified: true });

			return res.json(await getToken(user));
		} catch (error) {
			throw new HTTPError((error as Error).toString(), 400);
		}
	},
);

export default router;
