import { Request, Response, Router } from "express";
import {
	Guild,
	Member,
	User,
	toObject,
	GuildMemberAddEvent,
	getPermission,
	PermissionResolvable,
	Role,
	GuildMemberUpdateEvent,
	emitEvent
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { addMember, isMember, removeMember } from "../../../../../util/Member";
import { check } from "../../../../../util/instanceOf";
import { MemberChangeSchema } from "../../../../../schema/Member";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	await isMember(req.user_id, guild_id);

	const member = await Member.findOneOrFail({ id: member_id, guild_id });

	return res.json(member);
});

router.patch("/", check(MemberChangeSchema), async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	const body = req.body as MemberChangeSchema;
	if (body.roles) {
		const roles = await Role.find({ id: { $in: body.roles } });
		if (body.roles.length !== roles.length) throw new HTTPError("Roles not found", 404);
		// TODO: check if user has permission to add role
	}

	const member = await Member.findOneOrFailAndUpdate({ id: member_id, guild_id }, body, { new: true });

	await emitEvent({
		event: "GUILD_MEMBER_UPDATE",
		guild_id,
		data: member
	} as GuildMemberUpdateEvent);

	res.json(member);
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
