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

import {
	IPAnalysis,
	getIpAdress,
	isProxy,
	route,
	verifyCaptcha,
} from "@spacebar/api";
import {
	Config,
	FieldErrors,
	Invite,
	RegisterSchema,
	User,
	ValidRegistrationToken,
	adjustEmail,
	generateToken,
} from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { MoreThan } from "typeorm";

const router: Router = Router();

router.post(
	"/",
	route({
		requestBody: "RegisterSchema",
		responses: {
			200: { body: "TokenOnlyResponse" },
			400: { body: "APIErrorOrCaptchaResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as RegisterSchema;
		const { register, security, limits } = Config.get();
		const ip = getIpAdress(req);

		// Reg tokens
		// They're a one time use token that bypasses registration limits ( rates, disabled reg, etc )
		let regTokenUsed = false;
		if (req.get("Referrer") && req.get("Referrer")?.includes("token=")) {
			// eg theyre on https://staging.spacebar.chat/register?token=whatever
			const token = req.get("Referrer")?.split("token=")[1].split("&")[0];
			if (token) {
				const regToken = await ValidRegistrationToken.findOneOrFail({
					where: { token, expires_at: MoreThan(new Date()) },
				});
				await regToken.remove();
				regTokenUsed = true;
				console.log(
					`[REGISTER] Registration token ${token} used for registration!`,
				);
			} else {
				console.log(
					`[REGISTER] Invalid registration token ${token} used for registration by ${ip}!`,
				);
			}
		}

		// email will be slightly modified version of the user supplied email -> e.g. protection against GMail Trick
		const email = adjustEmail(body.email);

		// check if registration is allowed
		if (!regTokenUsed && !register.allowNewRegistration) {
			throw FieldErrors({
				email: {
					code: "REGISTRATION_DISABLED",
					message: req.t("auth:register.REGISTRATION_DISABLED"),
				},
			});
		}

		// check if the user agreed to the Terms of Service
		if (!body.consent) {
			throw FieldErrors({
				consent: {
					code: "CONSENT_REQUIRED",
					message: req.t("auth:register.CONSENT_REQUIRED"),
				},
			});
		}

		if (!regTokenUsed && register.disabled) {
			throw FieldErrors({
				email: {
					code: "DISABLED",
					message: "registration is disabled on this instance",
				},
			});
		}

		if (
			!regTokenUsed &&
			register.requireCaptcha &&
			security.captcha.enabled
		) {
			const { sitekey, service } = security.captcha;
			if (!body.captcha_key) {
				return res?.status(400).json({
					captcha_key: ["captcha-required"],
					captcha_sitekey: sitekey,
					captcha_service: service,
				});
			}

			const verify = await verifyCaptcha(body.captcha_key, ip);
			if (!verify.success) {
				return res.status(400).json({
					captcha_key: verify["error-codes"],
					captcha_sitekey: sitekey,
					captcha_service: service,
				});
			}
		}

		if (!regTokenUsed && !register.allowMultipleAccounts) {
			// TODO: check if fingerprint was eligible generated
			const exists = await User.findOne({
				where: { fingerprints: body.fingerprint },
				select: ["id"],
			});

			if (exists) {
				throw FieldErrors({
					email: {
						code: "EMAIL_ALREADY_REGISTERED",
						message: req.t(
							"auth:register.EMAIL_ALREADY_REGISTERED",
						),
					},
				});
			}
		}

		if (!regTokenUsed && register.blockProxies) {
			if (isProxy(await IPAnalysis(ip))) {
				console.log(`proxy ${ip} blocked from registration`);
				throw new HTTPError("Your IP is blocked from registration");
			}
		}

		// TODO: gift_code_sku_id?
		// TODO: check password strength

		if (email) {
			// replace all dots and chars after +, if its a gmail.com email
			if (!email) {
				throw FieldErrors({
					email: {
						code: "INVALID_EMAIL",
						message: req?.t("auth:register.INVALID_EMAIL"),
					},
				});
			}

			// check if there is already an account with this email
			const exists = await User.findOne({ where: { email: email } });

			if (exists) {
				throw FieldErrors({
					email: {
						code: "EMAIL_ALREADY_REGISTERED",
						message: req.t(
							"auth:register.EMAIL_ALREADY_REGISTERED",
						),
					},
				});
			}
		} else if (register.email.required) {
			throw FieldErrors({
				email: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED"),
				},
			});
		}

		if (register.dateOfBirth.required && !body.date_of_birth) {
			throw FieldErrors({
				date_of_birth: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED"),
				},
			});
		} else if (
			register.dateOfBirth.required &&
			register.dateOfBirth.minimum
		) {
			const minimum = new Date();
			minimum.setFullYear(
				minimum.getFullYear() - register.dateOfBirth.minimum,
			);
			body.date_of_birth = new Date(body.date_of_birth as Date);

			// higher is younger
			if (body.date_of_birth > minimum) {
				throw FieldErrors({
					date_of_birth: {
						code: "DATE_OF_BIRTH_UNDERAGE",
						message: req.t("auth:register.DATE_OF_BIRTH_UNDERAGE", {
							years: register.dateOfBirth.minimum,
						}),
					},
				});
			}
		}

		if (body.password) {
                        if(body.password.length < register.password.minLength){
                                throw FieldErrors({
                                        password: {
                                                code: "PASSWORD_REQUIREMENTS_MIN_LENGTH",
                                                message: req.t("auth:register.PASSWORD_REQUIREMENTS_MIN_LENGTH")
                                        }
                                });
                        }
			// the salt is saved in the password refer to bcrypt docs
			body.password = await bcrypt.hash(body.password, 12);
		} else if (register.password.required) {
			throw FieldErrors({
				password: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED"),
				},
			});
		}

		if (
			!regTokenUsed &&
			!body.invite &&
			(register.requireInvite ||
				(register.guestsRequireInvite && !register.email))
		) {
			// require invite to register -> e.g. for organizations to send invites to their employees
			throw FieldErrors({
				email: {
					code: "INVITE_ONLY",
					message: req.t("auth:register.INVITE_ONLY"),
				},
			});
		}

		if (
			!regTokenUsed &&
			limits.absoluteRate.register.enabled &&
			(await User.count({
				where: {
					created_at: MoreThan(
						new Date(
							Date.now() - limits.absoluteRate.register.window,
						),
					),
				},
			})) >= limits.absoluteRate.register.limit
		) {
			console.log(
				`Global register ratelimit exceeded for ${getIpAdress(req)}, ${
					req.body.username
				}, ${req.body.invite || "No invite given"}`,
			);
			throw FieldErrors({
				email: {
					code: "TOO_MANY_REGISTRATIONS",
					message: req.t("auth:register.TOO_MANY_REGISTRATIONS"),
				},
			});
		}

		const user = await User.register({ ...body, req });

		if (body.invite) {
			// await to fail if the invite doesn't exist (necessary for requireInvite to work properly) (username only signups are possible)
			await Invite.joinGuild(user.id, body.invite);
		}

		return res.json({ token: await generateToken(user.id) });
	},
);

export default router;

/**
 * POST /auth/register
 * @argument { "fingerprint":"805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw", "email":"qo8etzvaf@gmail.com", "username":"qp39gr98", "password":"wtp9gep9gw", "invite":null, "consent":true, "date_of_birth":"2000-04-04", "gift_code_sku_id":null, "captcha_key":null}
 *
 * Field Error
 * @returns { "code": 50035, "errors": { "consent": { "_errors": [{ "code": "CONSENT_REQUIRED", "message": "You must agree to Discord's Terms of Service and Privacy Policy." }]}}, "message": "Invalid Form Body"}
 *
 * Success 200:
 * @returns {token: "OMITTED"}
 */
