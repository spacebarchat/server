import { Channel, emitEvent, EmojiModel, GuildDeleteEvent, Guild, InviteModel, Member, Message, Role, User } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/", async (req: Request, res: Response) => {
	var { guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ id: guild_id }, "owner_id");
	if (guild.owner_id !== req.user_id) throw new HTTPError("You are not the owner of this guild", 401);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guild_id
		},
		guild_id: guild_id
	} as GuildDeleteEvent);

	await Promise.all([
		Guild.deleteOne({ id: guild_id }),
		User.updateMany({ guilds: guild_id }, { $pull: { guilds: guild_id } }),
		Role.deleteMany({ guild_id }),
		Channel.deleteMany({ guild_id }),
		Emoji.deleteMany({ guild_id }),
		Invite.deleteMany({ guild_id }),
		Message.deleteMany({ guild_id }),
		Member.deleteMany({ guild_id })
	]);

	return res.sendStatus(204);
});

export default router;
