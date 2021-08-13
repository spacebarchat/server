import { getPermission, PermissionResolvable } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { check } from "lambert-server";
import { MemberNickChangeSchema } from "../../../../../schema/Member";
import { changeNickname } from "../../../../../util/Member";

const router = Router();

router.patch("/", check(MemberNickChangeSchema), async (req: Request, res: Response) => {
	var { guild_id, member_id } = req.params;
	var permissionString: PermissionResolvable = "MANAGE_NICKNAMES";
	if (member_id === "@me") {
		member_id = req.user_id;
		permissionString = "CHANGE_NICKNAME";
	}

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow(permissionString);

	await changeNickname(member_id, guild_id, req.body.nick);
	res.status(200).send();
});

export default router;
