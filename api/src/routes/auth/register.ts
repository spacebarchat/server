import { Request, Response, Router } from "express";
import { trimSpecial, User, Config, defaultSettings } from "@fosscord/util";
import bcrypt from "bcrypt";
import { FieldErrors, route } from "@fosscord/api";
import "missing-native-js-functions";
import { generateToken } from "./login";
import { getIpAdress, IPAnalysis, isProxy, EMAIL_REGEX } from "@fosscord/api";
import { HTTPError } from "lambert-server";

const router: Router = Router();

export interface RegisterSchema {
	/**
	 * @minLength 2
	 * @maxLength 32
	 */
	username: string;
	/**
	 * @minLength 1
	 * @maxLength 72
	 */
	password: string; // TODO: use password strength of config
	consent: boolean;
	/**
	 * @TJS-format email
	 */
	email?: string;
	fingerprint?: string;
	invite?: string;
	date_of_birth?: Date; // "2000-04-03"
	gift_code_sku_id?: string;
	captcha_key?: string;
}

router.post("/", route({ body: "RegisterSchema" }), async (req: Request, res: Response) => {
	const {
		email,
		username,
		password,
		consent,
		fingerprint,
		invite,
		date_of_birth,
		gift_code_sku_id, // ? what is this
		captcha_key
	} = req.body;

	// get register Config
	const { register, security } = Config.get();
	const ip = getIpAdress(req);

	if (register.blockProxies) {
		if (isProxy(await IPAnalysis(ip))) {
			console.log(`proxy ${ip} blocked from registration`);
			throw new HTTPError("Your IP is blocked from registration");
		}
	}

	console.log("register", req.body.email, req.body.username, ip);
	// TODO: automatically join invite
	// TODO: gift_code_sku_id?
	// TODO: check password strength

	// adjusted_email will be slightly modified version of the user supplied email -> e.g. protection against GMail Trick
	let adjusted_email = adjustEmail(email);

	// adjusted_password will be the hash of the password
	let adjusted_password = "";

	// trim special uf8 control characters -> Backspace, Newline, ...
	let adjusted_username = trimSpecial(username);

	// check if registration is allowed
	if (!register.allowNewRegistration) {
		throw FieldErrors({
			email: { code: "REGISTRATION_DISABLED", message: req.t("auth:register.REGISTRATION_DISABLED") }
		});
	}

	// check if the user agreed to the Terms of Service
	if (!consent) {
		throw FieldErrors({
			consent: { code: "CONSENT_REQUIRED", message: req.t("auth:register.CONSENT_REQUIRED") }
		});
	}

	// require invite to register -> e.g. for organizations to send invites to their employees
	if (register.requireInvite && !invite) {
		throw FieldErrors({
			email: { code: "INVITE_ONLY", message: req.t("auth:register.INVITE_ONLY") }
		});
	}

	if (email) {
		// replace all dots and chars after +, if its a gmail.com email
		if (!adjusted_email) throw FieldErrors({ email: { code: "INVALID_EMAIL", message: req.t("auth:register.INVALID_EMAIL") } });

		// check if there is already an account with this email
		const exists = await User.findOneOrFail({ email: adjusted_email }).catch((e) => {});

		if (exists) {
			throw FieldErrors({
				email: {
					code: "EMAIL_ALREADY_REGISTERED",
					message: req.t("auth:register.EMAIL_ALREADY_REGISTERED")
				}
			});
		}
	} else if (register.email.necessary) {
		throw FieldErrors({
			email: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	}

	if (register.dateOfBirth.necessary && !date_of_birth) {
		throw FieldErrors({
			date_of_birth: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	} else if (register.dateOfBirth.minimum) {
		const minimum = new Date();
		minimum.setFullYear(minimum.getFullYear() - register.dateOfBirth.minimum);

		// higher is younger
		if (date_of_birth > minimum) {
			throw FieldErrors({
				date_of_birth: {
					code: "DATE_OF_BIRTH_UNDERAGE",
					message: req.t("auth:register.DATE_OF_BIRTH_UNDERAGE", { years: register.dateOfBirth.minimum })
				}
			});
		}
	}

	if (!register.allowMultipleAccounts) {
		// TODO: check if fingerprint was eligible generated
		const exists = await User.findOne({ where: { fingerprints: fingerprint } });

		if (exists) {
			throw FieldErrors({
				email: {
					code: "EMAIL_ALREADY_REGISTERED",
					message: req.t("auth:register.EMAIL_ALREADY_REGISTERED")
				}
			});
		}
	}

	if (register.requireCaptcha && security.captcha.enabled) {
		if (!captcha_key) {
			const { sitekey, service } = security.captcha;
			return res.status(400).json({
				captcha_key: ["captcha-required"],
				captcha_sitekey: sitekey,
				captcha_service: service
			});
		}

		// TODO: check captcha
	}

	// the salt is saved in the password refer to bcrypt docs
	adjusted_password = await bcrypt.hash(password, 12);

	// TODO: save date_of_birth
	// appearently discord doesn't save the date of birth and just calculate if nsfw is allowed
	// if nsfw_allowed is null/undefined it'll require date_of_birth to set it to true/false

	try {
		var user = await User.register({
			username: adjusted_username,
			data: {
				hash: adjusted_password,
				valid_tokens_since: new Date()
			},
			settings: { ...defaultSettings, locale: req.language || "en-US" }
		});
	} catch (error) {
		throw FieldErrors({
			username: {
				code: "USERNAME_TOO_MANY_USERS",
				message: req.t("auth:register.USERNAME_TOO_MANY_USERS")
			}
		});
	}

	return res.json({ token: await generateToken(user.id) });
});

export function adjustEmail(email: string): string | undefined {
	// body parser already checked if it is a valid email
	const parts = <RegExpMatchArray>email.match(EMAIL_REGEX);
	// @ts-ignore
	if (!parts || parts.length < 5) return undefined;
	const domain = parts[5];
	const user = parts[1];

	// TODO: check accounts with uncommon email domains
	if (domain === "gmail.com" || domain === "googlemail.com") {
		// replace .dots and +alternatives -> Gmail Dot Trick https://support.google.com/mail/answer/7436150 and https://generator.email/blog/gmail-generator
		return user.replace(/[.]|(\+.*)/g, "") + "@gmail.com";
	}

	return email;
}

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
