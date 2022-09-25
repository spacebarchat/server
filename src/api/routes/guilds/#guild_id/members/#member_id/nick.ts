import { getPermission, Member, PermissionResolvable } from "@fosscord/util";
import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

export interface MemberNickChangeSchema {
	nick: string;
}

router.patch("/", route({ body: "MemberNickChangeSchema" }), async (req: Request, res: Response) => {
	var { guild_id, member_id } = req.params;
	var permissionString: PermissionResolvable = "MANAGE_NICKNAMES";
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
