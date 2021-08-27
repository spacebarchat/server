import { Router, Request, Response } from "express";
import { getPermission, Guild, Invite } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { addMember } from "../../util/Member";
const router: Router = Router();

router.get("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await Invite.findOneOrFail({ code });
	if (!invite) throw new HTTPError("Unknown Invite", 404);

	res.status(200).send(invite);
});

router.post("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await Invite.findOneOrFailAndUpdate({ code }, { $inc: { uses: 1 } }, { new: true });
	if (!invite) throw new HTTPError("Unknown Invite", 404);
	if (invite.uses >= invite.max_uses) await Invite.deleteOne({ code });

	await addMember(req.user_id, invite.guild_id);

	res.status(200).send(invite);
});

router.delete("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;
	const invite = await Invite.findOneOrFail({ code });
	const { guild_id, channel_id } = invite;

	const guild = await Guild.findOneOrFail({ id: guild_id });
	const permission = await getPermission(req.user_id, guild_id, channel_id, { guild });

	if (!permission.has("MANAGE_GUILD") && !permission.has("MANAGE_CHANNELS"))
		throw new HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);

	await Invite.deleteOne({ code });

	await Guild.update({ vanity_url_code: code }, { $unset: { vanity_url_code: 1 } }).catch((e) => {});

	res.json({ invite: invite });
});

export default router;
