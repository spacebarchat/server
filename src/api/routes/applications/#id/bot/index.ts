import { route } from "@fosscord/api";
import { Application, Config, FieldErrors, generateToken, handleFile, HTTPError, OrmUtils, trimSpecial, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { verifyToken } from "node-2fa";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	const app = await Application.findOne({ where: { id: req.params.id } });
	if (!app) return res.status(404);
	const username = trimSpecial(app.name);
	const discriminator = await User.generateDiscriminator(username);
	if (!discriminator) {
		// We've failed to generate a valid and unused discriminator
		throw FieldErrors({
			username: {
				code: "USERNAME_TOO_MANY_USERS",
				message: req?.t("auth:register.USERNAME_TOO_MANY_USERS")
			}
		});
	}

	const user = OrmUtils.mergeDeep(new User(), {
		created_at: new Date(),
		username: username,
		discriminator,
		id: app.id,
		bot: true,
		system: false,
		premium_since: null,
		desktop: false,
		mobile: false,
		premium: false,
		premium_type: 0,
		bio: app.description,
		mfa_enabled: true,
		totp_secret: "",
		totp_backup_codes: [],
		verified: true,
		disabled: false,
		deleted: false,
		email: null,
		rights: Config.get().register.defaultRights,
		nsfw_allowed: true,
		public_flags: "0",
		flags: "0",
		data: {
			hash: null,
			valid_tokens_since: new Date()
		},
		settings: {},
		extended_settings: {},
		fingerprints: [],
	});
	await user.save();
	app.bot = user;
	await app.save();
	res.send().status(204);
});

router.post("/reset", route({}), async (req: Request, res: Response) => {
	let bot = await User.findOne({ where: { id: req.params.id } });
	let owner = await User.findOne({ where: { id: req.user_id } });
	if (!bot) return res.status(404);
	if (owner?.totp_secret && (!req.body.code || verifyToken(owner.totp_secret, req.body.code))) {
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);
	}
	bot.data = { hash: undefined, valid_tokens_since: new Date() };
	await bot.save();
	let token = await generateToken(bot.id);
	res.json({ token }).status(200);
});

router.patch("/", route({}), async (req: Request, res: Response) => {
	if (req.body.avatar) req.body.avatar = await handleFile(`/avatars/${req.params.id}`, req.body.avatar as string);
	let app = OrmUtils.mergeDeep(await User.findOne({ where: { id: req.params.id } }), req.body);
	await app.save();
	res.json(app).status(200);
});

export default router;
