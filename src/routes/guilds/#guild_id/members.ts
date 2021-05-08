import { Request, Response, Router } from "express";
import { GuildModel, MemberModel, UserModel, toObject, GuildMemberAddEvent, getPermission, PermissionResolvable } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { instanceOf, Length, check } from "../../../util/instanceOf";
import { PublicMemberProjection, addMember, removeMember, addRole, removeRole, changeNickname } from "../../../util/Member";
import { emitEvent } from "../../../util/Event";
import { MemberNickChangeSchema } from "../../../schema/Member";
import { getPublicUser } from "../../../util/User";

const router = Router();

// TODO: not allowed for user -> only allowed for bots with privileged intents
// TODO: send over websocket
router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	try {
		instanceOf({ $limit: new Length(Number, 1, 1000), $after: String }, req.query, {
			path: "query",
			req,
			ref: { obj: null, key: "" },
		});
	} catch (error) {
		return res.status(400).json({ code: 50035, message: "Invalid Query", success: false, errors: error });
	}

	// @ts-ignore
	if (!req.query.limit) req.query.limit = 1;
	const { limit, after } = (<unknown>req.query) as { limit: number; after: string };
	const query = after ? { id: { $gt: after } } : {};

	var members = await MemberModel.find({ guild_id, ...query }, PublicMemberProjection)
		.limit(limit)
		.exec();

	return res.json(toObject(members));
});

router.get("/:member_id", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	const member = await MemberModel.findOne({ id: member_id, guild_id }).exec();
	if (!member) throw new HTTPError("Member not found", 404);

	return res.json(toObject(member));
});

router.put("/:member_id", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	await addMember(member_id, guild_id);
	res.sendStatus(204)
});


router.delete("/:member_id", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	await removeMember(member_id, guild_id);
	res.sendStatus(204)
});

router.delete("/:member_id/roles/:role_id", async (req: Request, res: Response) => {
	const { guild_id, role_id, member_id } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_ROLES");

	await removeRole(member_id, guild_id, role_id);
	res.sendStatus(204);
});

router.put("/:member_id/roles/:role_id", async (req: Request, res: Response) => {
	const { guild_id, role_id, member_id } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_ROLES");

	await addRole(member_id, guild_id, role_id);
	res.sendStatus(204);
});

router.patch("/:member_id/nick", check(MemberNickChangeSchema), async (req: Request, res: Response) => {
	var { guild_id, member_id } = req.params;
	var permissionString:PermissionResolvable = "MANAGE_NICKNAMES";
	if(member_id === "@me") {
		member_id = req.user_id;
		permissionString = "CHANGE_NICKNAME";
	}
 
	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow(permissionString);

	await changeNickname(member_id, guild_id, req.body.nickname);
	res.status(204);
});


export default router;
