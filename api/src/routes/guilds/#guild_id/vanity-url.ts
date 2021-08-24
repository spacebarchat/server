import { Channel, ChannelType, getPermission, Guild, InviteModel, trimSpecial } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { check, Length } from "../../../util/instanceOf";
import { isMember } from "../../../util/Member";

const router = Router();

const InviteRegex = /\W/g;

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const permission = await getPermission(req.user_id, guild_id);
	permission.hasThrow("MANAGE_GUILD");

	const guild = await Guild.findOneOrFail({ id: guild_id });
	if (!guild.vanity_url_code) return res.json({ code: null });
	const { uses } = await Invite.findOneOrFail({ code: guild.vanity_url_code });

	return res.json({ code: guild.vanity_url_code, uses });
});

// TODO: check if guild is elgible for vanity url
router.patch("/", check({ code: new Length(String, 0, 20) }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	var code = req.body.code.replace(InviteRegex);
	if (!code) code = null;

	const guild = await Guild.findOneOrFail({ id: guild_id });
	const permission = await getPermission(req.user_id, guild_id, undefined, { guild });
	permission.hasThrow("MANAGE_GUILD");

	const alreadyExists = await Promise.all([
		Guild.findOneOrFail({ vanity_url_code: code }).catch(() => null),
		Invite.findOneOrFail({ code: code }).catch(() => null)
	]);
	if (alreadyExists.some((x) => x)) throw new HTTPError("Vanity url already exists", 400);

	await Guild.update({ id: guild_id }, { vanity_url_code: code });
	const { id } = await Channel.findOneOrFail({ guild_id, type: ChannelType.GUILD_TEXT });
	await Invite.update(
		{ code: guild.vanity_url_code },
		{
			code: code,
			uses: 0,
			created_at: new Date(),
			guild_id,
			channel_id: id
		},
		{ upsert: true }
	);

	return res.json({ code: code });
});

export default router;
