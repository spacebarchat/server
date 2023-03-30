/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
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
	adjustEmail,
	Config,
	FieldErrors,
	generateToken,
	generateWebAuthnTicket,
	LoginSchema,
	User,
	WebAuthn,
} from "@fosscord/util";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response, Router } from "express";

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
			where: [{ phone: login }, { email: email }],
			select: [
				"data",
				"id",
				"disabled",
				"deleted",
				"totp_secret",
				"mfa_enabled",
				"webauthn_enabled",
				"security_keys",
				"verified",
			],
			relations: ["security_keys", "settings"],
		}).catch(() => {
			throw FieldErrors({
				login: {
					message: req.t("auth:login.INVALID_LOGIN"),
					code: "INVALID_LOGIN",
				},
			});
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

		// return an error for unverified accounts if verification is required
		if (config.login.requireVerification && !user.verified) {
			throw FieldErrors({
				login: {
					code: "ACCOUNT_LOGIN_VERIFICATION_EMAIL",
					message:
						"Email verification is required, please check your email.",
				},
			});
		}

		if (user.mfa_enabled && !user.webauthn_enabled) {
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

		if (user.mfa_enabled && user.webauthn_enabled) {
			if (!WebAuthn.fido2) {
				// TODO: I did this for typescript and I can't use !
				throw new Error("WebAuthn not enabled");
			}

			const options = await WebAuthn.fido2.assertionOptions();
			const challenge = JSON.stringify({
				publicKey: {
					...options,
					challenge: Buffer.from(options.challenge).toString(
						"base64",
					),
					allowCredentials: user.security_keys.map((x) => ({
						id: x.key_id,
						type: "public-key",
					})),
					transports: ["usb", "ble", "nfc"],
					timeout: 60000,
				},
			});

			const ticket = await generateWebAuthnTicket(challenge);
			await User.update({ id: user.id }, { totp_last_ticket: ticket });

			return res.json({
				ticket: ticket,
				mfa: true,
				sms: false, // TODO
				token: null,
				webauthn: challenge,
			});
		}

		if (undelete) {
			// undelete refers to un'disable' here
			if (user.disabled)
				await User.update({ id: user.id }, { disabled: false });
			if (user.deleted)
				await User.update({ id: user.id }, { deleted: false });
		} else {
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
		}

		const token = await generateToken(user.id);

		// Notice this will have a different token structure, than discord
		// Discord header is just the user id as string, which is not possible with npm-jsonwebtoken package
		// https://user-images.githubusercontent.com/6506416/81051916-dd8c9900-8ec2-11ea-8794-daf12d6f31f0.png

		res.json({ token, settings: { ...user.settings, index: undefined } });
	},
);

/**
 * POST /auth/login
 * @argument { login: "email@gmail.com", password: "cleartextpassword", undelete: false, captcha_key: null, login_source: null, gift_code_sku_id: null, }

 * MFA required:
 * @returns {"token": null, "mfa": true, "sms": true, "ticket": "SOME TICKET JWT TOKEN"}

 * WebAuthn MFA required:
 * @returns {"token": null, "mfa": true, "webauthn": true, "sms": true, "ticket": "SOME TICKET JWT TOKEN"}

 * Captcha required:
 * @returns {"captcha_key": ["captcha-required"], "captcha_sitekey": null, "captcha_service": "recaptcha"}

 * Sucess:
 * @returns {"token": "USERTOKEN", "settings": {"locale": "en", "theme": "dark"}}

 */
