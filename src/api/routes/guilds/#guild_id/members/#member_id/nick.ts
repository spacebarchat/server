import { route } from "@fosscord/api";
import { getPermission, Member, PermissionResolvable } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.patch("/", route({ body: "MemberNickChangeSchema" }), async (req: Request, res: Response) => {
	let { guild_id, member_id } = req.params;
	let permissionString: PermissionResolvable = "MANAGE_NICKNAMES";
	if (member_id === "@me") {
		member_id = req.user_id;
		permissionString = "CHANGE_NICKNAME";
	}

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow(permissionString);

	await Member.changeNickname(member_id, guild_id, req.body.nick);
	res.status(200).send();
});

export default router;
