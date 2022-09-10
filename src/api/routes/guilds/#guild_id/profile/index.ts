import { route } from "@fosscord/api";
import { emitEvent, GuildMemberUpdateEvent, handleFile, Member, MemberChangeProfileSchema, OrmUtils } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.patch("/:member_id", route({ body: "MemberChangeProfileSchema" }), async (req: Request, res: Response) => {
	let { guild_id, member_id } = req.params;
	if (member_id === "@me") member_id = req.user_id;
	const body = req.body as MemberChangeProfileSchema;

	let member = await Member.findOneOrFail({ where: { id: req.user_id, guild_id }, relations: ["roles", "user"] });

	if (body.banner) body.banner = await handleFile(`/guilds/${guild_id}/users/${req.user_id}/avatars`, body.banner as string);

	member = await OrmUtils.mergeDeep(member, body);

	await member.save();

	// do not use promise.all as we have to first write to db before emitting the event to catch errors
	await emitEvent({
		event: "GUILD_MEMBER_UPDATE",
		guild_id,
		data: { ...member, roles: member.roles.map((x) => x.id) }
	} as GuildMemberUpdateEvent);

	res.json(member);
});

export default router;
