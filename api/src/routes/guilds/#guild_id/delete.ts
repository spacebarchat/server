import { Channel, emitEvent, GuildDeleteEvent, Guild, Member, Message, Role, Invite, Emoji } from "@fosscord/util";
import { Router, Request, Response } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

// discord prefixes this route with /delete instead of using the delete method
// docs are wrong https://discord.com/developers/docs/resources/guild#delete-guild
router.post("/", async (req: Request, res: Response) => {
	var { guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: ["owner_id"] });
	if (guild.owner_id !== req.user_id) throw new HTTPError("You are not the owner of this guild", 401);

	await emitEvent({
		event: "GUILD_DELETE",
		data: {
			id: guild_id
		},
		guild_id: guild_id
	} as GuildDeleteEvent);

	await Promise.all([
		Guild.delete({ id: guild_id }),
		Role.delete({ guild_id }),
		Channel.delete({ guild_id }),
		Emoji.delete({ guild_id }),
		Invite.delete({ guild_id }),
		Message.delete({ guild_id }),
		Member.delete({ guild_id })
	]);

	return res.sendStatus(204);
});

export default router;
