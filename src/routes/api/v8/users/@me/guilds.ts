import { Router, Request, Response } from "express";
import {
	GuildModel,
	MemberModel,
	UserModel,
	GuildDeleteEvent,
	GuildMemberRemoveEvent,
} from "../../channels/#channelid/node_modules/fosscord-server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../../../util/Event";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne(
		{ id: req.userid },
		"guilds username discriminator id public_flags avatar"
	).exec();

	if (!user) throw new HTTPError("User not found", 404);

	var guildIDs = user.guilds || [];
	var guildsss = await GuildModel.find({ id: { $in: guildIDs } }).exec();
	res.json(guildsss);
});

router.delete("/:id", async (req: Request, res: Response) => {
	const guildID = BigInt(req.params.id);
	if (await GuildModel.findOne({ id: guildID, owner_id: req.userid }).exec())
		throw new HTTPError("You can't leave your own guild", 400);
	var user = await UserModel.findOneAndUpdate({ id: req.userid }, { $pull: { guilds: guildID } }).exec();
	await MemberModel.deleteOne({ id: req.userid, guild_id: guildID }).exec();
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
