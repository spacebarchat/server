import { Router, Response, Request } from "express";
import { Channel, Config, emitEvent, getPermission, getRights, MessageDeleteBulkEvent, Message } from "@fosscord/util";
import { HTTPError } from "@fosscord/util";
import { route } from "@fosscord/api";
import { In } from "typeorm";

const router: Router = Router();

export default router;

// should users be able to bulk delete messages or only bots? ANSWER: all users
// should this request fail, if you provide messages older than 14 days/invalid ids? ANSWER: NO
// https://discord.com/developers/docs/resources/channel#bulk-delete-messages
router.post("/", route({ body: "BulkDeleteSchema" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const channel = await Channel.findOneByOrFail({ id: channel_id });
	if (!channel.guild_id) throw new HTTPError("Can't bulk delete dm channel messages", 400);

	const rights = await getRights(req.user_id);
	rights.hasThrow("SELF_DELETE_MESSAGES");

	let superuser = rights.has("MANAGE_MESSAGES");
	const permission = await getPermission(req.user_id, channel?.guild_id, channel_id);

	const { maxBulkDelete } = Config.get().limits.message;

	const { messages } = req.body as { messages: string[] };
	if (messages.length === 0) throw new HTTPError("You must specify messages to bulk delete");
	if (!superuser) {
		permission.hasThrow("MANAGE_MESSAGES");
		if (messages.length > maxBulkDelete) throw new HTTPError(`You cannot delete more than ${maxBulkDelete} messages`);
	}

	await Message.delete({ id: In(messages) });

	await emitEvent({
		event: "MESSAGE_DELETE_BULK",
		channel_id,
		data: { ids: messages, channel_id, guild_id: channel.guild_id }
	} as MessageDeleteBulkEvent);

	res.sendStatus(204);
});
