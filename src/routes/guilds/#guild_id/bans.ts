import { Request, Response, Router } from "express";
import { BanModel, getPermission, GuildBanAddEvent, GuildBanRemoveEvent, GuildModel, toObject } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { getIpAdress } from "../../../util/ipAddress";
import { BanCreateSchema } from "../../../schema/Ban";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import { removeMember } from "../../../util/Member";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const guild = await GuildModel.exists({ id: guild_id });
	if (!guild) throw new HTTPError("Guild not found", 404);

	var bans = await BanModel.find({ guild_id: guild_id }, { user: true, reason: true }).exec();
	return res.json(toObject(bans));
});

router.get("/:user", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const user_id = req.params.ban;

	var ban = await BanModel.findOne({ guild_id: guild_id, user_id: user_id }).exec();
	return res.json(ban);
});

router.put("/:user_id", check(BanCreateSchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const banned_user_id = req.params.user_id;

	const banned_user = await getPublicUser(banned_user_id);
	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("BAN_MEMBERS");
	if (req.user_id === banned_user_id) throw new HTTPError("You can't ban yourself", 400);

	await removeMember(banned_user_id, guild_id);

	const ban = await new BanModel({
		user_id: banned_user_id,
		guild_id: guild_id,
		ip: getIpAdress(req),
		executor_id: req.user_id,
		reason: req.body.reason // || otherwise empty
	}).save();

	await emitEvent({
		event: "GUILD_BAN_ADD",
		data: {
			guild_id: guild_id,
			user: banned_user
		},
		guild_id: guild_id
	} as GuildBanAddEvent);

	return res.json(toObject(ban));
});

router.delete("/:user_id", async (req: Request, res: Response) => {
	var { guild_id } = req.params;
	var banned_user_id = req.params.user_id;

	const banned_user = await getPublicUser(banned_user_id);
	const guild = await GuildModel.exists({ id: guild_id });
	if (!guild) throw new HTTPError("Guild not found", 404);

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("BAN_MEMBERS");

	await BanModel.deleteOne({
		user_id: banned_user_id,
		guild_id
	}).exec();

	await emitEvent({
		event: "GUILD_BAN_REMOVE",
		data: {
			guild_id,
			user: banned_user
		},
		guild_id
	} as GuildBanRemoveEvent);

	return res.status(204).send();
});

export default router;
