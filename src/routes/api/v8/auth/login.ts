import { Request, Response, Router } from "express";
import { check, FieldErrors, Length } from "../../../../util/instanceOf";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Config from "../../../../util/Config";
import { User } from "../../../../models/User";
import { adjustEmail } from "./register";
import { db } from "discord-server-util";

const router: Router = Router();
export default router;

router.post(
	"/",
	check({
		login: new Length(String, 2, 100), // email or telephone
		password: new Length(String, 8, 64),
		$undelete: Boolean,
		$captcha_key: String,
		$login_source: String,
		$gift_code_sku_id: String,
	}),
	async (req: Request, res: Response) => {
		const { login, password } = req.body;

		// * MongoDB Specific query for user with same email or phone number
		const userquery = { $or: [{ email: adjustEmail(login) }, { phone: login }] };
		const user: User = await db.data
			.users(userquery)
			.get({ hash: true, id: true, user_settings: { locale: true, theme: true } });

		if (!user) {
			throw FieldErrors({
				login: { message: req.t("auth:login.INVALID_LOGIN"), code: "INVALID_LOGIN" },
			});
		}

		// the salt is saved in the password refer to bcrypt docs
		const same_password = await bcrypt.compare(password, user.hash);
		if (!same_password) {
			throw FieldErrors({
				password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" },
			});
		}

		const token = await generateToken(user.id);

		// Notice this will have a different token structure, than discord
		// Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
		// https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png

		res.json({ token, user_settings: user.user_settings });
	}
);

export async function generateToken(id: bigint) {
	const iat = Math.floor(Date.now() / 1000);
	const algorithm = "HS256";

	return new Promise((res, rej) => {
		jwt.sign(
			{ id: `${id}`, iat },
			Config.get().security.jwtSecret,
			{
				algorithm,
			},
			(err, token) => {
				if (err) return rej(err);
				return res(token);
			}
		);
	});
}

/**
 * POST /auth/login
 * @argument { login: "email@gmail.com", password: "cleartextpassword", undelete: false, captcha_key: null, login_source: null, gift_code_sku_id: null, }
 

 * MFA required:
 * @returns {"token": null, "mfa": true, "sms": true, "ticket": "SOME TICKET JWT TOKEN"}
 
 * Captcha required:
 * @returns {"captcha_key": ["captcha-required"], "captcha_sitekey": null, "captcha_service": "recaptcha"}
 
 * Sucess:
 * @returns {"token": "USERTOKEN", "user_settings": {"locale": "en", "theme": "dark"}}
 
 */
