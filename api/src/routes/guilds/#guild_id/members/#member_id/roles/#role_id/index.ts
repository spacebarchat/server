import { getPermission, Member } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.delete("/:member_id/roles/:role_id", async (req: Request, res: Response) => {
	const { guild_id, role_id, member_id } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_ROLES");

	await Member.removeRole(member_id, guild_id, role_id);
	res.sendStatus(204);
});

router.put("/:member_id/roles/:role_id", async (req: Request, res: Response) => {
	const { guild_id, role_id, member_id } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_ROLES");

	await Member.addRole(member_id, guild_id, role_id);
	res.sendStatus(204);
});

export default router;
