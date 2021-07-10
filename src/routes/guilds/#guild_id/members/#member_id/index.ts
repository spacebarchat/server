import { Request, Response, Router } from "express";
import {
	GuildModel,
	MemberModel,
	UserModel,
	toObject,
	GuildMemberAddEvent,
	getPermission,
	PermissionResolvable,
	RoleModel,
	GuildMemberUpdateEvent
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { addMember, isMember, removeMember } from "../../../../../util/Member";
import { check } from "../../../../../util/instanceOf";
import { MemberChangeSchema } from "../../../../../schema/Member";
import { emitEvent } from "../../../../../util/Event";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	await isMember(req.user_id, guild_id);

	const member = await MemberModel.findOne({ id: member_id, guild_id }).exec();

	return res.json(toObject(member));
});

router.patch("/", check(MemberChangeSchema), async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	const body = req.body as MemberChangeSchema;
	if (body.roles) {
		const roles = await RoleModel.find({ id: { $in: body.roles } }).exec();
		if (body.roles.length !== roles.length) throw new HTTPError("Roles not found", 404);
		// TODO: check if user has permission to add role
	}

	const member = await MemberModel.findOneAndUpdate({ id: member_id, guild_id }, body).exec();

	await emitEvent({
		event: "GUILD_MEMBER_UPDATE",
		guild_id,
		data: toObject(member)
	} as GuildMemberUpdateEvent);

	res.json(toObject(member));
});

router.put("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	throw new HTTPError("Maintenance: Currently you can't add a member", 403);
	// TODO: only for oauth2 applications
	await addMember(member_id, guild_id);
	res.sendStatus(204);
});

router.delete("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("KICK_MEMBERS");

	await removeMember(member_id, guild_id);
	res.sendStatus(204);
});

export default router;
