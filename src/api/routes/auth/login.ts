import { Request, Response, Router } from "express";
import { route, getIpAdress, verifyCaptcha } from "@fosscord/api";
import bcrypt from "bcrypt";
import {
	Config,
	User,
	generateToken,
	adjustEmail,
	FieldErrors,
	LoginSchema,
} from "@fosscord/util";
import crypto from "crypto";

const router: Router = Router();
export default router;

router.post(
	"/",
	route({ body: "LoginSchema" }),
	async (req: Request, res: Response) => {
		const { login, password, captcha_key, undelete } =
			req.body as LoginSchema;
		const email = adjustEmail(login);

		const config = Config.get();

		if (config.login.requireCaptcha && config.security.captcha.enabled) {
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
			select: [
				"data",
				"id",
				"disabled",
				"deleted",
				"settings",
				"totp_secret",
				"mfa_enabled",
			],
		}).catch((e) => {
			throw FieldErrors({
				login: {
					message: req.t("auth:login.INVALID_LOGIN"),
					code: "INVALID_LOGIN",
				},
			});
		});

		if (undelete) {
			if (user.deleted)
				await User.update({ id: user.id }, { deleted: false });
		} else {
			if (user.deleted)
				return res.status(400).json({
					message: "This account is scheduled for deletion.",
					code: 20011,
				});
		}

		if (user.disabled)
			return res.status(400).json({
				message: req.t("auth:login.ACCOUNT_DISABLED"),
				code: 20013,
			});

		// the salt is saved in the password refer to bcrypt docs
		const same_password = await bcrypt.compare(
			password,
			user.data.hash || "",
		);
		if (!same_password) {
			throw FieldErrors({
				password: {
					message: req.t("auth:login.INVALID_PASSWORD"),
					code: "INVALID_PASSWORD",
				},
			});
		}

		if (user.mfa_enabled) {
			// TODO: This is not a discord.com ticket. I'm not sure what it is but I'm lazy
			const ticket = crypto.randomBytes(40).toString("hex");

			await User.update({ id: user.id }, { totp_last_ticket: ticket });

			return res.json({
				ticket: ticket,
				mfa: true,
				sms: false, // TODO
				token: null,
			});
		}

		const token = await generateToken(user.id);

		// Notice this will have a different token structure, than discord
		// Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
		// https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png

		res.json({ token, settings: user.settings });
	},
);

/**
 * POST /auth/login
 * @argument { login: "email@gmail.com", password: "cleartextpassword", undelete: false, captcha_key: null, login_source: null, gift_code_sku_id: null, }

 * MFA required:
 * @returns {"token": null, "mfa": true, "sms": true, "ticket": "SOME TICKET JWT TOKEN"}

 * Captcha required:
 * @returns {"captcha_key": ["captcha-required"], "captcha_sitekey": null, "captcha_service": "recaptcha"}

 * Sucess:
 * @returns {"token": "USERTOKEN", "settings": {"locale": "en", "theme": "dark"}}

 */
