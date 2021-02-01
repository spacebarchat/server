import { Request, Response, Router } from "express";
import Config from "../../../../util/Config";
import db from "../../../../util/Database";
import bcrypt from "bcrypt";
import { check, Email, EMAIL_REGEX, FieldErrors } from "../../../../util/instanceOf";
import { Snowflake } from "../../../../util/Snowflake";
import "missing-native-js-functions";
import { User } from "../../../../models/User";
import { generateToken } from "./login";
import { trim } from "../../../../util/String";
const router: Router = Router();

router.post(
	"/",
	check({
		username: String,
		password: String,
		consent: Boolean,
		$email: Email,
		$fingerprint: String,
		$invite: String,
		$date_of_birth: String, // "2000-04-03"
		$gift_code_sku_id: String,
		$captcha_key: String,
	}),
	async (req: Request, res: Response) => {
		const {
			email,
			username,
			password,
			consent,
			fingerprint,
			invite,
			date_of_birth,
			gift_code_sku_id, // ? what is this
			captcha_key,
		} = req.body;
		// TODO: automatically join invite
		// TODO: gift_code_sku_id?

		let adjusted_email: string = email;
		let adjusted_password: string = password;
		let adjusted_username: string = trim(username);
		const { register } = Config.get();

		if (!register.allowNewRegistration) {
			throw FieldErrors({
				email: { code: "REGISTRATION_DISABLED", message: req.t("auth:register.REGISTRATION_DISABLED") },
			});
		}

		if (!consent) {
			throw FieldErrors({
				consent: { code: "CONSENT_REQUIRED", message: req.t("auth:register.CONSENT_REQUIRED") },
			});
		}

		if (register.requireInvite && !invite) {
			throw FieldErrors({
				email: { code: "INVITE_ONLY", message: req.t("auth:register.INVITE_ONLY") },
			});
		}

		if (email) {
			const parts = email.match(EMAIL_REGEX);
			const domain = parts[5];
			const user = parts[1];

			if (domain === "gmail.com") {
				// replace .dots and +alternatives -> Gmail Dot Trick https://support.google.com/mail/answer/7436150 and https://generator.email/blog/gmail-generator
				adjusted_email = user.replace(/[.]|(\+.*)/g, "");
			}

			const exists = await db.data.users({ email: adjusted_email }).get();
			if (exists) {
				throw FieldErrors({
					email: {
						code: "EMAIL_ALREADY_REGISTERED",
						message: req.t("auth.register.EMAIL_ALREADY_REGISTERED"),
					},
				});
			}
		} else if (register.email.required) {
			throw FieldErrors({
				email: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") },
			});
		}

		if (register.dateOfBirth.required && !date_of_birth) {
			throw FieldErrors({
				date_of_birth: { code: "BASE_TYPE_REQUIRED", message: req.t("common:field.BASE_TYPE_REQUIRED") },
			});
		} else if (register.dateOfBirth.minimum) {
			const minimum = new Date();
			minimum.setFullYear(minimum.getFullYear() - register.dateOfBirth.minimum);

			// higher is younger
			if (date_of_birth > minimum) {
				throw FieldErrors({
					date_of_birth: {
						code: "DATE_OF_BIRTH_UNDERAGE",
						message: req.t("auth:register.DATE_OF_BIRTH_UNDERAGE"),
					},
				});
			}
		}

		if (!register.allowMultipleAccounts) {
			// TODO: check if fingerprint was eligible generated
			const exists = await db.data.users({ fingerprint }).get();
			if (exists) {
				throw FieldErrors({
					email: {
						code: "EMAIL_ALREADY_REGISTERED",
						message: req.t("auth:register.EMAIL_ALREADY_REGISTERED"),
					},
				});
			}
		}

		if (register.requireCaptcha) {
			if (!captcha_key) {
				const { sitekey, service } = Config.get().security.captcha;
				return res
					.status(400)
					.json({ captcha_key: ["captcha-required"], captcha_sitekey: sitekey, captcha_service: service });
			}

			// TODO: check captcha
		}

		adjusted_password = await bcrypt.hash(password, 12);
		adjusted_username = username.replace(/[]/g, "");
		var discriminator = "";
		let exists;
		// TODO: is there any better way to generate a random discriminator only once, without checking if it already exists in the database?
		for (let tries = 5; tries >= 0; tries--) {
			discriminator = Math.randomBetween(1, 9999).toString().padStart(4, "0");
			exists = await db.data.users({ discriminator, username: adjusted_username }).get({ id: true });
			if (!exists) break;
		}

		if (exists) {
			throw FieldErrors({
				username: {
					code: "USERNAME_TOO_MANY_USERS",
					message: req.t("auth:register.USERNAME_TOO_MANY_USERS"),
				},
			});
		}

		const user: User = {
			id: Snowflake.generate(),
			created_at: Date.now(),
			username: adjusted_username,
			discriminator,
			avatar: null,
			bot: false,
			system: false,
			mfa_enabled: false,
			verified: false,
			email: adjusted_email,
			flags: 0n, // TODO: generate default flags
			hash: adjusted_password,
			valid_tokens_since: Date.now(),
			user_settings: {
				afk_timeout: 300,
				allow_accessibility_detection: true,
				animate_emoji: true,
				animate_stickers: 0,
				contact_sync_enabled: false,
				convert_emoticons: false,
				custom_status: {
					emoji_id: null,
					emoji_name: null,
					expires_at: null,
					text: null,
				},
				default_guilds_restricted: false,
				detect_platform_accounts: true,
				developer_mode: false,
				disable_games_tab: false,
				enable_tts_command: true,
				explicit_content_filter: 0,
				friend_source_flags: { all: true },
				gif_auto_play: true,
				guild_folders: [],
				guild_positions: [],
				inline_attachment_media: true,
				inline_embed_media: true,
				locale: req.language,
				message_display_compact: false,
				native_phone_integration_enabled: true,
				render_embeds: true,
				render_reactions: true,
				restricted_guilds: [],
				show_current_game: true,
				status: "offline",
				stream_notifications_enabled: true,
				theme: "dark",
				timezone_offset: 0,
				// timezone_offset: // TODO: timezone from request
			},
		};

		await db.data.users.push(user);

		const token = generateToken(user.id);

		return res.json({ token });
	}
);

export default router;

/**
 * POST /auth/register
 * @argument { "fingerprint":"805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw", "email":"qo8etzvaf@gmail.com", "username":"qp39gr98", "password":"wtp9gep9gw", "invite":null, "consent":true, "date_of_birth":"2000-04-04", "gift_code_sku_id":null, "captcha_key":null}
 *
 * Field Error
 * @returns { "code": 50035, "errors": { "consent": { "_errors": [{ "code": "CONSENT_REQUIRED", "message": "You must agree to Discord's Terms of Service and Privacy Policy." }]}}, "message": "Invalid Form Body"}
 *
 * Success 201:
 * @returns {token: "OMITTED"}
 */
