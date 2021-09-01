import { Request, Response, Router } from "express";
import {
	Guild,
	Member,
	User,
	GuildMemberAddEvent,
	getPermission,
	PermissionResolvable,
	Role,
	GuildMemberUpdateEvent,
	emitEvent
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { check } from "../../../../../util/instanceOf";
import { MemberChangeSchema } from "../../../../../schema/Member";
import { In } from "typeorm";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const member = await Member.findOneOrFail({ id: member_id, guild_id });

	return res.json(member);
});

router.patch("/", check(MemberChangeSchema), async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;
	const body = req.body as MemberChangeSchema;
	if (body.roles) {
		const roles = await Role.find({ id: In(body.roles) });
		if (body.roles.length !== roles.length) throw new HTTPError("Roles not found", 404);
		// TODO: check if user has permission to add role
	}

	const member = await Member.findOneOrFail({ id: member_id, guild_id });
	member.assign(req.body);

	Promise.all([
		member.save(),
		emitEvent({
			event: "GUILD_MEMBER_UPDATE",
			guild_id,
			data: { ...member, roles: member.roles.map((x) => x.id) }
		} as GuildMemberUpdateEvent)
	]);

	res.json(member);
});

router.put("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	throw new HTTPError("Maintenance: Currently you can't add a member", 403);
	// TODO: only for oauth2 applications
	await Member.addToGuild(member_id, guild_id);
	res.sendStatus(204);
});

router.delete("/", async (req: Request, res: Response) => {
	const { guild_id, member_id } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("KICK_MEMBERS");

	await Member.removeFromGuild(member_id, guild_id);
	res.sendStatus(204);
});

export default router;
