import {
	ChannelModel,
	EmojiModel,
	GuildDeleteEvent,
	GuildModel,
	InviteModel,
	MessageModel,
	RoleModel,
	UserModel
} from "@fosscord/server-util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";

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

	await GuildModel.deleteOne({ id: guild_id }).exec();
	await UserModel.updateMany({ guilds: guild_id }, { $pull: { guilds: guild_id } }).exec();
	await RoleModel.deleteMany({ guild_id }).exec();
	await ChannelModel.deleteMany({ guild_id }).exec();
	await EmojiModel.deleteMany({ guild_id }).exec();
	await InviteModel.deleteMany({ guild_id }).exec();
	await MessageModel.deleteMany({ guild_id }).exec();

	return res.sendStatus(204);
});

export default router;
