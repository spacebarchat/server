import { Router, Request, Response } from "express";
import { getPermission, Guild, Invite, Member } from "@fosscord/util";
import { HTTPError } from "lambert-server";
const router: Router = Router();

router.get("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await Invite.findOneOrFail({ code });

	res.status(200).send(invite);
});

router.post("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await Invite.findOneOrFail({ code });
	if (invite.uses++ >= invite.max_uses) await Invite.delete({ code });
	else await invite.save();

	await Member.addToGuild(req.user_id, invite.guild_id);

	res.status(200).send(invite);
});

router.delete("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;
	const invite = await Invite.findOneOrFail({ code });
	const { guild_id, channel_id } = invite;

	const permission = await getPermission(req.user_id, guild_id, channel_id);

	if (!permission.has("MANAGE_GUILD") && !permission.has("MANAGE_CHANNELS"))
		throw new HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);

	await Promise.all([Invite.delete({ code }), Guild.update({ vanity_url_code: code }, { vanity_url_code: undefined })]);

	res.json({ invite: invite });
});

export default router;
