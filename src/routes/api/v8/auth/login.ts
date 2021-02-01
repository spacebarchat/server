import { Request, Response, Router } from "express";
import db from "../../../../util/Database";
import { check, FieldErrors } from "../../../../util/instanceOf";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Config from "../../../../util/Config";
import { User } from "../../../../models/User";
const router: Router = Router();

router.post(
	"/",
	check({
		login: String, // email or telephone
		password: String,
		$undelete: Boolean,
		$captcha_key: String,
		$login_source: String,
		$gift_code_sku_id: String,
	}),
	async (req: Request, res: Response) => {
		const { login, password } = req.body;
		const userquery = { $or: [{ email: login }, { phone: login }] };
		const user: User = await db.data
			.users(userquery)
			.get({ hash: true, id: true, user_settings: { locale: true, theme: true } });

		if (!user) {
			throw FieldErrors({
				login: { message: req.t("auth:login.INVALID_LOGIN"), code: "INVALID_LOGIN" },
			});
		}

		const same_password = await bcrypt.compare(password, user.hash);
		if (!same_password) {
			throw FieldErrors({
				password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" },
			});
		}

		const token = generateToken(user.id);

		// Notice this will have a different token structure, than discord
		// Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
		// https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png

		res.json({ token, user_settings: user.user_settings });
	}
);

export function generateToken(id: bigint) {
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

export default router;

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
