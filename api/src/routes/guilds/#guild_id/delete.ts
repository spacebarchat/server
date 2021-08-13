import {
	ChannelModel,
	emitEvent,
	EmojiModel,
	GuildDeleteEvent,
	GuildModel,
	InviteModel,
	MemberModel,
	MessageModel,
	RoleModel,
	UserModel
} from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/", async (req: Request, res: Response) => {
	var { guild_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, "owner_id").exec();
	if (guild.owner_id !== req.user_id) throw new HTTPError("You are not the owner of this guild", 401);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guild_id
		},
		guild_id: guild_id
	} as GuildDeleteEvent);

	await Promise.all([
		GuildModel.deleteOne({ id: guild_id }).exec(),
		UserModel.updateMany({ guilds: guild_id }, { $pull: { guilds: guild_id } }).exec(),
		RoleModel.deleteMany({ guild_id }).exec(),
		ChannelModel.deleteMany({ guild_id }).exec(),
		EmojiModel.deleteMany({ guild_id }).exec(),
		InviteModel.deleteMany({ guild_id }).exec(),
		MessageModel.deleteMany({ guild_id }).exec(),
		MemberModel.deleteMany({ guild_id }).exec()
	]);

	return res.sendStatus(204);
});

export default router;
