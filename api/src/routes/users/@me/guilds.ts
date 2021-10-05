import { Router, Request, Response } from "express";
import { Guild, Member, User, GuildDeleteEvent, GuildMemberRemoveEvent, emitEvent, Config } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const members = await Member.find({ relations: ["guild"], where: { id: req.user_id } });

	res.json(members.map((x) => x.guild));
});

// user send to leave a certain guild
router.delete("/:guild_id", route({}), async (req: Request, res: Response) => {
	const { autoJoin } = Config.get().guild;
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: ["owner_id"] });

	if (!guild) throw new HTTPError("Guild doesn't exist", 404);
	if (guild.owner_id === req.user_id) throw new HTTPError("You can't leave your own guild", 400);
	if (autoJoin.enabled && autoJoin.guilds.includes(guild_id) && !autoJoin.canLeave) {
		throw new HTTPError("You can't leave instance auto join guilds", 400);
	}

	await Promise.all([
		Member.delete({ id: req.user_id, guild_id: guild_id }),
		emitEvent({
			event: "GUILD_DELETE",
			data: {
				id: guild_id
			},
			user_id: req.user_id
		} as GuildDeleteEvent)
	]);

	const user = await User.getPublicUser(req.user_id);

	await emitEvent({
		event: "GUILD_MEMBER_REMOVE",
		data: {
			guild_id: guild_id,
			user: user
		},
		guild_id: guild_id
	} as GuildMemberRemoveEvent);

	return res.sendStatus(204);
});

export default router;
