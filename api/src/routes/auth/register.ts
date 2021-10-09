import { Request, Response, Router } from "express";
import { Config, generateToken, Invite, FieldErrors, User, adjustEmail, trimSpecial } from "@fosscord/util";
import { route, getIpAdress, IPAnalysis, isProxy } from "@fosscord/api";
import "missing-native-js-functions";
import bcrypt from "bcrypt";
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
	password?: string;
	consent: boolean;
	/**
	 * @TJS-format email
	 */
	email?: string;
	fingerprint?: string;
	invite?: string;
	/**
	 * @TJS-type string
	 */
	date_of_birth?: Date; // "2000-04-03"
	gift_code_sku_id?: string;
	captcha_key?: string;
}

router.post("/", route({ body: "RegisterSchema" }), async (req: Request, res: Response) => {
	const body = req.body as RegisterSchema;
	const { register, security } = Config.get();
	const ip = getIpAdress(req);

	// email will be slightly modified version of the user supplied email -> e.g. protection against GMail Trick
	let email = adjustEmail(body.email);

	// check if registration is allowed
	if (!register.allowNewRegistration) {
		throw FieldErrors({
			email: { code: "REGISTRATION_DISABLED", message: req.t("auth:register.REGISTRATION_DISABLED") }
		});
	}

	// check if the user agreed to the Terms of Service
	if (!body.consent) {
		throw FieldErrors({
			consent: { code: "CONSENT_REQUIRED", message: req.t("auth:register.CONSENT_REQUIRED") }
		});
	}

	if (register.disabled) {
		throw FieldErrors({
			email: {
				code: "DISABLED",
				message: "registration is disabled on this instance"
			}
		});
	}

	if (register.requireCaptcha && security.captcha.enabled) {
		if (!body.captcha_key) {
			const { sitekey, service } = security.captcha;
			return res?.status(400).json({
				captcha_key: ["captcha-required"],
				captcha_sitekey: sitekey,
				captcha_service: service
			});
		}

		// TODO: check captcha
	}

	if (!register.allowMultipleAccounts) {
		// TODO: check if fingerprint was eligible generated
		const exists = await User.findOne({ where: { fingerprints: body.fingerprint }, select: ["id"] });

		if (exists) {
			throw FieldErrors({
				email: {
					code: "EMAIL_ALREADY_REGISTERED",
					message: req.t("auth:register.EMAIL_ALREADY_REGISTERED")
				}
			});
		}
	}

	if (register.blockProxies) {
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
			throw FieldErrors({ email: { code: "INVALID_EMAIL", message: req?.t("auth:register.INVALID_EMAIL") } });
		}

		// check if there is already an account with this email
		const exists = await User.findOne({ email: email });

		if (exists) {
			throw FieldErrors({
				email: {
					code: "EMAIL_ALREADY_REGISTERED",
					message: req.t("auth:register.EMAIL_ALREADY_REGISTERED")
				}
			});
		}
	} else if (register.email.required) {
		throw FieldErrors({
			email: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	}

	if (register.dateOfBirth.required && !body.date_of_birth) {
		throw FieldErrors({
			date_of_birth: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	} else if (register.dateOfBirth.minimum) {
		const minimum = new Date();
		minimum.setFullYear(minimum.getFullYear() - register.dateOfBirth.minimum);
		body.date_of_birth = new Date(body.date_of_birth as Date);

		// higher is younger
		if (body.date_of_birth > minimum) {
			throw FieldErrors({
				date_of_birth: {
					code: "DATE_OF_BIRTH_UNDERAGE",
					message: req.t("auth:register.DATE_OF_BIRTH_UNDERAGE", { years: register.dateOfBirth.minimum })
				}
			});
		}
	}

	if (body.password) {
		// the salt is saved in the password refer to bcrypt docs
		body.password = await bcrypt.hash(body.password, 12);
	} else if (register.password.required) {
		throw FieldErrors({
			password: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	}

	if (!body.invite && (register.requireInvite || (register.guestsRequireInvite && !register.email))) {
		// require invite to register -> e.g. for organizations to send invites to their employees
		throw FieldErrors({
			email: { code: "INVITE_ONLY", message: req.t("auth:register.INVITE_ONLY") }
		});
	}

	const user = await User.register({ ...body, req });

	if (body.invite) {
		// await to fail if the invite doesn't exist (necessary for requireInvite to work properly) (username only signups are possible)
		await Invite.joinGuild(user.id, body.invite);
	}

	console.log("register", body.email, body.username, ip);

	return res.json({ token: await generateToken(user.id) });
});

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
