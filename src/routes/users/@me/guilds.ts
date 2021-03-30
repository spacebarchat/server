import { Router, Request, Response } from "express";
import { GuildModel, MemberModel, UserModel, GuildDeleteEvent, GuildMemberRemoveEvent } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({ id: req.user_id }, { guilds: true }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var guildIDs = user.guilds || [];
	var guild = await GuildModel.find({ id: { $in: guildIDs } }).exec();
	res.json(guild);
});

// user send to leave a certain guild
router.delete("/:id", async (req: Request, res: Response) => {
	const guildID = BigInt(req.params.id);
	const guild = await GuildModel.findOne({ id: guildID }).exec();

	if (!guild) throw new HTTPError("Guild doesn't exist", 404);
	if (guild.owner_id === req.user_id) throw new HTTPError("You can't leave your own guild", 400);

	await MemberModel.deleteOne({ id: req.user_id, guild_id: guildID }).exec();
	await UserModel.updateOne({ id: req.user_id }, { $pull: { guilds: guildID } }).exec();
	const user = await getPublicUser(req.user_id);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guildID,
		},
		user_id: req.user_id,
	} as GuildDeleteEvent);

	await emitEvent({
		event: "GUILD_MEMBER_REMOVE",
		data: {
			guild_id: guildID,
			user: user,
		},
		guild_id: guildID,
	} as GuildMemberRemoveEvent);

	return res.status(204).send();
});

export default router;
