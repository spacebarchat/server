import { getPermission, Member, PermissionResolvable } from "@fosscord/util";
import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.patch(
	"/",
	route({ body: "MemberNickChangeSchema" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		let permissionString: PermissionResolvable = "MANAGE_NICKNAMES";
		const member_id =
			req.params.member_id === "@me"
				? ((permissionString = "CHANGE_NICKNAME"), req.user_id)
				: req.params.member_id;

		const perms = await getPermission(req.user_id, guild_id);
		perms.hasThrow(permissionString);

		await Member.changeNickname(member_id, guild_id, req.body.nick);
		res.status(200).send();
	},
);

export default router;
