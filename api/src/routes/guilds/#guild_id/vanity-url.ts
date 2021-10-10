import { Channel, ChannelType, getPermission, Guild, Invite, trimSpecial } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { HTTPError } from "lambert-server";

const router = Router();

const InviteRegex = /\W/g;

router.get("/", route({ permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const invite = await Invite.findOne({ where: {guild_id: guild_id, vanity_url: true} });
	if (!invite) return res.json({ code: null });

	return res.json({ code: invite.code, uses: invite.uses });
});

export interface VanityUrlSchema {
	/**
	 * @minLength 1
	 * @maxLength 20
	 */
	code?: string;
}

// TODO: check if guild is elgible for vanity url
router.patch("/", route({ body: "VanityUrlSchema", permission: "MANAGE_GUILD" }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const body = req.body as VanityUrlSchema;
	const code = body.code?.replace(InviteRegex, "");

	const invite = await Invite.findOne({ code });
	if (invite) throw new HTTPError("Invite already exists");

	const { id } = await Channel.findOneOrFail({ guild_id, type: ChannelType.GUILD_TEXT });

	Promise.all([
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
