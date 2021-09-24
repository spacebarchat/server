import { getPermission, Member } from "@fosscord/util";
import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.delete("/", route({ permission: "MANAGE_ROLES" }), async (req: Request, res: Response) => {
	const { guild_id, role_id, member_id } = req.params;

	await Member.removeRole(member_id, guild_id, role_id);
	res.sendStatus(204);
});

router.put("/", route({ permission: "MANAGE_ROLES" }), async (req: Request, res: Response) => {
	const { guild_id, role_id, member_id } = req.params;

	await Member.addRole(member_id, guild_id, role_id);
	res.sendStatus(204);
});

export default router;
