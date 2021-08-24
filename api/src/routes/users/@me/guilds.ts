import { Router, Request, Response } from "express";
import { Guild, Member, User, GuildDeleteEvent, GuildMemberRemoveEvent, toObject, emitEvent } from "@fosscord/util";
import { HTTPError } from "lambert-server";

import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ id: req.user_id }, { guilds: true });
	if (!user) throw new HTTPError("User not found", 404);

	var guildIDs = user.guilds || [];
	var guild = await Guild.find({ id: { $in: guildIDs } }).populate({ path: "joined_at", match: { id: req.user_id } });
	res.json(guild);
});

// user send to leave a certain guild
router.delete("/:id", async (req: Request, res: Response) => {
	const guild_id = req.params.id;
	const guild = await Guild.findOneOrFail({ id: guild_id }, { guild_id: true });

	if (!guild) throw new HTTPError("Guild doesn't exist", 404);
	if (guild.owner_id === req.user_id) throw new HTTPError("You can't leave your own guild", 400);

	await Promise.all([
		Member.deleteOne({ id: req.user_id, guild_id: guild_id }),
		User.update({ id: req.user_id }, { $pull: { guilds: guild_id } }),
		emitEvent({
			event: "GUILD_DELETE",
			data: {
				id: guild_id
			},
			user_id: req.user_id
		} as GuildDeleteEvent)
	]);

	const user = await getPublicUser(req.user_id);

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
