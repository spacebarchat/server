import { getPermission, InviteModel, toObject } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const permissions = await getPermission(req.user_id, guild_id);
	permissions.hasThrow("MANAGE_GUILD");

	const invites = await InviteModel.find({ guild_id }).exec();

	return res.json(toObject(invites));
});

export default router;
