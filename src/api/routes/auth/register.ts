import { route } from "@fosscord/api";
import {
	adjustEmail,
	Config,
	FieldErrors,
	generateToken,
	getIpAdress,
	HTTPError,
	Invite,
	IPAnalysis,
	isProxy,
	RegisterSchema,
	User,
	ValidRegistrationToken,
	verifyCaptcha
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { red, yellow } from "picocolors";
import { LessThan, MoreThan } from "typeorm";

let bcrypt: any;
try {
	bcrypt = require("bcrypt");
} catch {
	bcrypt = require("bcryptjs");
	console.log("Warning: using bcryptjs because bcrypt is not installed! Performance will be affected.");
}

const router: Router = Router();

router.post("/", route({ body: "RegisterSchema" }), async (req: Request, res: Response) => {
	const body = req.body as RegisterSchema;
	const { register, security, limits } = Config.get();
	const ip = getIpAdress(req);

	// email will be slightly modified version of the user supplied email -> e.g. protection against GMail Trick
	let email = adjustEmail(body.email);

	// check if the user agreed to the Terms of Service
	if (!body.consent) {
		throw FieldErrors({
			consent: { code: "CONSENT_REQUIRED", message: req.t("auth:register.CONSENT_REQUIRED") }
		});
	}

	if (register.requireCaptcha && security.captcha.enabled) {
		const { sitekey, service } = security.captcha;
		if (!body.captcha_key) {
			return res?.status(400).json({
				captcha_key: ["captcha-required"],
				captcha_sitekey: sitekey,
				captcha_service: service
			});
		}

		const verify = await verifyCaptcha(body.captcha_key, ip);
		if (!verify.success) {
			return res.status(400).json({
				captcha_key: verify["error-codes"],
				captcha_sitekey: sitekey,
				captcha_service: service
			});
		}
	}

	// check if registration is allowed
	if (!register.allowNewRegistration) {
		throw FieldErrors({
			email: { code: "REGISTRATION_DISABLED", message: req.t("auth:register.REGISTRATION_DISABLED") }
		});
	}

	if (register.blockProxies) {
		let data;
		try {
			data = await IPAnalysis(ip);
		} catch (e: any) {
			console.warn(red(`[REGISTER]: Failed to analyze IP ${ip}: failed to contact api.ipdata.co!`), e.message);
		}

		if (data && isProxy(data)) {
			console.log(yellow(`[REGISTER] Proxy ${ip} blocked from registration!`));
			throw new HTTPError(req.t("auth:register.IP_BLOCKED"));
		}
	}

	// TODO: gift_code_sku_id?
	// TODO: check password strength

	if (email) {
		// check if there is already an account with this email
		const exists = await User.findOne({ where: { email: email } });

		if (exists && !register.disabled) {
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

	// If no password is provided, this is a guest account
	if (register.dateOfBirth.required && !body.date_of_birth && body.password) {
		throw FieldErrors({
			date_of_birth: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") }
		});
	} else if (register.dateOfBirth.required && register.dateOfBirth.minimum) {
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

	//check if email starts with any valid registration token
	let validToken = false;
	if (req.get("Referrer") && req.get("Referrer")?.includes("token=")) {
		let token = req.get("Referrer")?.split("token=")[1].split("&")[0];
		if (token) {
			await ValidRegistrationToken.delete({ expires_at: LessThan(new Date()) });
			let registrationToken = await ValidRegistrationToken.findOne({ where: { token: token, expires_at: MoreThan(new Date()) } });
			if (registrationToken) {
				console.log(yellow(`[REGISTER] Registration token ${token} used for registration!`));
				await ValidRegistrationToken.delete(token);
				validToken = true;
			} else {
				console.log(yellow(`[REGISTER] Invalid registration token ${token} used for registration by ${ip}!`));
			}
		}
	}

	if (
		!validToken &&
		limits.absoluteRate.register.enabled &&
		(await await User.count({ where: { created_at: MoreThan(new Date(Date.now() - limits.absoluteRate.register.window)) } })) >=
			limits.absoluteRate.register.limit
	) {
		console.log(
			yellow(
				`[REGISTER] Global register rate limit exceeded for ${getIpAdress(req)}: ${
					process.env.LOG_SENSITIVE ? req.body.email : "<email redacted>"
				}, ${req.body.username}, ${req.body.invite ?? "No invite given"}`
			)
		);
		throw FieldErrors({
			email: { code: "TOO_MANY_REGISTRATIONS", message: req.t("auth:register.TOO_MANY_REGISTRATIONS") }
		});
	}

	const user = await User.register({ ...body, req });

	if (body.invite) {
		// await to fail if the invite doesn't exist (necessary for requireInvite to work properly) (username only signups are possible)
		await Invite.joinGuild(user.id, body.invite);
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
