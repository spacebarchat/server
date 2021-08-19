import { ChannelModel, ChannelType, getPermission, GuildModel, InviteModel, trimSpecial } from "@fosscord/util";
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

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild.vanity_url_code) return res.json({ code: null });
	const { uses } = await InviteModel.findOne({ code: guild.vanity_url_code }).exec();

	return res.json({ code: guild.vanity_url_code, uses });
});

// TODO: check if guild is elgible for vanity url
router.patch("/", check({ code: new Length(String, 0, 20) }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	var code = req.body.code.replace(InviteRegex);
	if (!code) code = null;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	const permission = await getPermission(req.user_id, guild_id, undefined, { guild });
	permission.hasThrow("MANAGE_GUILD");

	const alreadyExists = await Promise.all([
		GuildModel.findOne({ vanity_url_code: code })
			.exec()
			.catch(() => null),
		InviteModel.findOne({ code: code })
			.exec()
			.catch(() => null)
	]);
	if (alreadyExists.some((x) => x)) throw new HTTPError("Vanity url already exists", 400);

	await GuildModel.updateOne({ id: guild_id }, { vanity_url_code: code }).exec();
	const { id } = await ChannelModel.findOne({ guild_id, type: ChannelType.GUILD_TEXT }).exec();
	await InviteModel.updateOne(
		{ code: guild.vanity_url_code },
		{
			code: code,
			uses: 0,
			created_at: new Date(),
			guild_id,
			channel_id: id
		},
		{ upsert: true }
	).exec();

	return res.json({ code: code });
});

export default router;
