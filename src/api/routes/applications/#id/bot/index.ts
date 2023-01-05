import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import {
	Application,
	generateToken,
	User,
	BotModifySchema,
	handleFile,
	DiscordApiErrors,
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";

const router: Router = Router();

router.post("/", route({}), async (req: Request, res: Response) => {
	const app = await Application.findOneOrFail({
		where: { id: req.params.id },
		relations: ["owner"],
	});

	if (app.owner.id != req.user_id)
		throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

	const user = await User.register({
		username: app.name,
		password: undefined,
		id: app.id,
		req,
	});

	user.id = app.id;
	user.premium_since = new Date();
	user.bot = true;

	await user.save();

	// flags is NaN here?
	app.assign({ bot: user, flags: app.flags || 0 });

	await app.save();

	res.send({
		token: await generateToken(user.id),
	}).status(204);
});

router.post("/reset", route({}), async (req: Request, res: Response) => {
	let bot = await User.findOneOrFail({ where: { id: req.params.id } });
	let owner = await User.findOneOrFail({ where: { id: req.user_id } });

	if (owner.id != req.user_id)
		throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

	if (
		owner.totp_secret &&
		(!req.body.code || verifyToken(owner.totp_secret, req.body.code))
	)
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	bot.data = { hash: undefined, valid_tokens_since: new Date() };

	await bot.save();

	let token = await generateToken(bot.id);

	res.json({ token }).status(200);
});

router.patch(
	"/",
	route({ body: "BotModifySchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as BotModifySchema;
		if (!body.avatar?.trim()) delete body.avatar;

		const app = await Application.findOneOrFail({
			where: { id: req.params.id },
			relations: ["bot", "owner"],
		});

		if (!app.bot) throw DiscordApiErrors.BOT_ONLY_ENDPOINT;

		if (app.owner.id != req.user_id)
			throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

		if (body.avatar)
			body.avatar = await handleFile(
				`/avatars/${app.id}`,
				body.avatar as string,
			);

		app.bot.assign(body);

		app.bot.save();

		await app.save();
		res.json(app).status(200);
	},
);

export default router;
