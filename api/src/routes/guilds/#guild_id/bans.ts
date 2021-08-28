import { Request, Response, Router } from "express";
import { emitEvent, getPermission, GuildBanAddEvent, GuildBanRemoveEvent, Guild, Ban, User, Member } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { getIpAdress } from "../../../util/ipAddress";
import { BanCreateSchema } from "../../../schema/Ban";

import { check } from "../../../util/instanceOf";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	var bans = await Ban.find({ guild_id: guild_id });
	return res.json(bans);
});

router.get("/:user", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const user_id = req.params.ban;

	var ban = await Ban.findOneOrFail({ guild_id: guild_id, user_id: user_id });
	return res.json(ban);
});

router.put("/:user_id", check(BanCreateSchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const banned_user_id = req.params.user_id;

	const banned_user = await User.getPublicUser(banned_user_id);
	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("BAN_MEMBERS");
	if (req.user_id === banned_user_id) throw new HTTPError("You can't ban yourself", 400);
	if (perms.cache.guild?.owner_id === banned_user_id) throw new HTTPError("You can't ban the owner", 400);

	const ban = new Ban({
		user_id: banned_user_id,
		guild_id: guild_id,
		ip: getIpAdress(req),
		executor_id: req.user_id,
		reason: req.body.reason // || otherwise empty
	});

	await Promise.all([
		Member.removeFromGuild(banned_user_id, guild_id),
		ban.save(),
		emitEvent({
			event: "GUILD_BAN_ADD",
			data: {
				guild_id: guild_id,
				user: banned_user
			},
			guild_id: guild_id
		} as GuildBanAddEvent)
	]);

	return res.json(ban);
});

router.delete("/:user_id", async (req: Request, res: Response) => {
	var { guild_id } = req.params;
	var banned_user_id = req.params.user_id;

	const banned_user = await User.getPublicUser(banned_user_id);
	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("BAN_MEMBERS");

	await Promise.all([
		Ban.delete({
			user_id: banned_user_id,
			guild_id
		}),

		emitEvent({
			event: "GUILD_BAN_REMOVE",
			data: {
				guild_id,
				user: banned_user
			},
			guild_id
		} as GuildBanRemoveEvent)
	]);

	return res.status(204).send();
});

export default router;
