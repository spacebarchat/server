import { Request, Response, Router } from "express";
import { trimSpecial, User, Snowflake, Config, defaultSettings, generateToken, Invite, adjustEmail } from "@fosscord/util";
import bcrypt from "bcrypt";
import { FieldErrors, route, getIpAdress, IPAnalysis, isProxy } from "@fosscord/api";
import "missing-native-js-functions";
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
	let {
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

	if (register.disabled) {
		throw FieldErrors({
			email: {
				code: "DISABLED",
				message: "registration is disabled on this instance"
			}
		});
	}

	if (register.blockProxies) {
		if (isProxy(await IPAnalysis(ip))) {
			console.log(`proxy ${ip} blocked from registration`);
			throw new HTTPError("Your IP is blocked from registration");
		}
	}

	console.log("register", req.body.email, req.body.username, ip);
	// TODO: gift_code_sku_id?
	// TODO: check password strength

	// email will be slightly modified version of the user supplied email -> e.g. protection against GMail Trick
	email = adjustEmail(email);

	// trim special uf8 control characters -> Backspace, Newline, ...
	username = trimSpecial(username);

	// discriminator will be randomly generated
	let discriminator = "";

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

	if (email) {
		// replace all dots and chars after +, if its a gmail.com email
		if (!email) throw FieldErrors({ email: { code: "INVALID_EMAIL", message: req.t("auth:register.INVALID_EMAIL") } });

		// check if there is already an account with this email
		const exists = await User.findOneOrFail({ email: email }).catch((e) => {});

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

	if (register.dateOfBirth.required && !date_of_birth) {
		throw FieldErrors({
			date_of_birth: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	} else if (register.dateOfBirth.minimum) {
		const minimum = new Date();
		minimum.setFullYear(minimum.getFullYear() - register.dateOfBirth.minimum);
		date_of_birth = new Date(date_of_birth);

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

	if (password) {
		// the salt is saved in the password refer to bcrypt docs
		password = await bcrypt.hash(password, 12);
	} else if (register.password.required) {
		throw FieldErrors({
			password: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	}

	let exists;
	// randomly generates a discriminator between 1 and 9999 and checks max five times if it already exists
	// if it all five times already exists, abort with USERNAME_TOO_MANY_USERS error
	// else just continue
	// TODO: is there any better way to generate a random discriminator only once, without checking if it already exists in the mongodb database?
	for (let tries = 0; tries < 5; tries++) {
		discriminator = Math.randomIntBetween(1, 9999).toString().padStart(4, "0");
		exists = await User.findOne({ where: { discriminator, username: username }, select: ["id"] });
		if (!exists) break;
	}

	if (exists) {
		throw FieldErrors({
			username: {
				code: "USERNAME_TOO_MANY_USERS",
				message: req.t("auth:register.USERNAME_TOO_MANY_USERS")
			}
		});
	}

	// TODO: save date_of_birth
	// appearently discord doesn't save the date of birth and just calculate if nsfw is allowed
	// if nsfw_allowed is null/undefined it'll require date_of_birth to set it to true/false

	const user = await new User({
		created_at: new Date(),
		username: username,
		discriminator,
		id: Snowflake.generate(),
		bot: false,
		system: false,
		desktop: false,
		mobile: false,
		premium: true,
		premium_type: 2,
		bio: "",
		mfa_enabled: false,
		verified: true,
		disabled: false,
		deleted: false,
		email: email,
		rights: "0",
		nsfw_allowed: true, // TODO: depending on age
		public_flags: "0",
		flags: "0", // TODO: generate
		data: {
			hash: password,
			valid_tokens_since: new Date()
		},
		settings: { ...defaultSettings, locale: req.language || "en-US" },
		fingerprints: []
	}).save();

	if (invite) {
		// await to fail if the invite doesn't exist (necessary for requireInvite to work properly) (username only signups are possible)
		await Invite.joinGuild(user.id, invite);
	} else if (register.requireInvite) {
		// require invite to register -> e.g. for organizations to send invites to their employees
		throw FieldErrors({
			email: { code: "INVITE_ONLY", message: req.t("auth:register.INVITE_ONLY") }
		});
	}

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
