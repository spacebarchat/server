import { Channel, ChannelType, getPermission, Guild, Invite, trimSpecial } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { check, Length } from "@fosscord/api";

const router = Router();

const InviteRegex = /\W/g;

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const permission = await getPermission(req.user_id, guild_id);
	permission.hasThrow("MANAGE_GUILD");

	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, relations: ["vanity_url"] });
	if (!guild.vanity_url) return res.json({ code: null });

	return res.json({ code: guild.vanity_url_code, uses: guild.vanity_url.uses });
});

// TODO: check if guild is elgible for vanity url
router.patch("/", check({ code: new Length(String, 0, 20) }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const code = req.body.code.replace(InviteRegex);

	await Invite.findOneOrFail({ code });

	const guild = await Guild.findOneOrFail({ id: guild_id });
	const permission = await getPermission(req.user_id, guild_id);
	permission.hasThrow("MANAGE_GUILD");

	const { id } = await Channel.findOneOrFail({ guild_id, type: ChannelType.GUILD_TEXT });
	guild.vanity_url_code = code;

	Promise.all([
		guild.save(),
		Invite.delete({ code: guild.vanity_url_code }),
		new Invite({
			code: code,
			uses: 0,
			created_at: new Date(),
			guild_id,
			channel_id: id
		}).save()
	]);

	return res.json({ code: code });
});

export default router;
