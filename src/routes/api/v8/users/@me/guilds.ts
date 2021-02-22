import { Router, Request, Response } from "express";
import { GuildModel, MemberModel, UserModel, GuildDeleteEvent, GuildMemberRemoveEvent } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../../../util/Event";
import { getPublicUser } from "../../../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne(
		{ id: req.userid },
		"guilds username discriminator id public_flags avatar"
	).exec();

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
	if (guild.owner_id === req.userid) throw new HTTPError("You can't leave your own guild", 400);

	await MemberModel.deleteOne({ id: req.userid, guild_id: guildID }).exec();
	await UserModel.updateOne({ id: req.userid }, { $pull: { guilds: guildID } }).exec();
	const user = await getPublicUser(req.userid);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guildID,
		},
		user_id: req.userid,
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
