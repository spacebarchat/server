import { Router, Request, Response } from "express";
import { getPermission, InviteModel, toObject } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
const router: Router = Router();

router.get("/:invite_code", async (req: Request, res: Response) => {
	const { invite_code: code } = req.params;

	const invite = await InviteModel.findOne({ code }).exec();

	if (!invite) throw new HTTPError("Unknown Invite", 404);
	res.status(200).send({ invite: toObject(invite) });
});

router.delete("/:invite_code", async (req: Request, res: Response) => {
	const { invite_code: code } = req.params;
	const invite = await InviteModel.findOne({ code }).exec();

	if (!invite) throw new HTTPError("Unknown Invite", 404);

	const { guild_id, channel_id } = invite;
	const perms = await getPermission(req.user_id, guild_id, channel_id);

	if (!perms.has("MANAGE_GUILD") && !perms.has("MANAGE_CHANNELS"))
		throw new HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);

	await InviteModel.deleteOne({ code }).exec();

	res.status(200).send({ invite: toObject(invite) });
});

export default router;
