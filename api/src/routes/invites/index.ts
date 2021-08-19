import { Router, Request, Response } from "express";
import { getPermission, GuildModel, InviteModel, toObject } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { addMember } from "../../util/Member";
const router: Router = Router();

router.get("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await InviteModel.findOne({ code }).exec();
	if (!invite) throw new HTTPError("Unknown Invite", 404);

	res.status(200).send(toObject(invite));
});

router.post("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await InviteModel.findOneAndUpdate({ code }, { $inc: { uses: 1 } }, { new: true }).exec();
	if (!invite) throw new HTTPError("Unknown Invite", 404);
	if (invite.uses >= invite.max_uses) await InviteModel.deleteOne({ code });

	await addMember(req.user_id, invite.guild_id);

	res.status(200).send(toObject(invite));
});

router.delete("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;
	const invite = await InviteModel.findOne({ code }).exec();
	const { guild_id, channel_id } = invite;

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	const permission = await getPermission(req.user_id, guild_id, channel_id, { guild });

	if (!permission.has("MANAGE_GUILD") && !permission.has("MANAGE_CHANNELS"))
		throw new HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);

	await InviteModel.deleteOne({ code }).exec();

	await GuildModel.updateOne({ vanity_url_code: code }, { $unset: { vanity_url_code: 1 } })
		.exec()
		.catch((e) => {});

	res.status(200).send({ invite: toObject(invite) });
});

export default router;
