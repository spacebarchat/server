import { Router, Request, Response } from "express";
import { GuildModel, MemberModel, UserModel, GuildDeleteEvent, GuildMemberRemoveEvent, toObject, emitEvent } from "@fosscord/util";
import { HTTPError } from "lambert-server";

import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({ id: req.user_id }, { guilds: true }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var guildIDs = user.guilds || [];
	var guild = await GuildModel.find({ id: { $in: guildIDs } })
		.populate({ path: "joined_at", match: { id: req.user_id } })
		.exec();

	res.json(toObject(guild));
});

// user send to leave a certain guild
router.delete("/:id", async (req: Request, res: Response) => {
	const guild_id = req.params.id;
	const guild = await GuildModel.findOne({ id: guild_id }, { guild_id: true }).exec();

	if (!guild) throw new HTTPError("Guild doesn't exist", 404);
	if (guild.owner_id === req.user_id) throw new HTTPError("You can't leave your own guild", 400);

	await Promise.all([
		MemberModel.deleteOne({ id: req.user_id, guild_id: guild_id }).exec(),
		UserModel.updateOne({ id: req.user_id }, { $pull: { guilds: guild_id } }).exec(),
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
