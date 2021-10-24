import { Router, Response, Request } from "express";
import { Channel, Config, emitEvent, getPermission, MessageDeleteBulkEvent, Message } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import { In } from "typeorm";

const router: Router = Router();

export default router;

export interface BulkDeleteSchema {
	messages: string[];
}

// TODO: should users be able to bulk delete messages or only bots?
// TODO: should this request fail, if you provide messages older than 14 days/invalid ids?
// https://discord.com/developers/docs/resources/channel#bulk-delete-messages
router.post("/", route({ body: "BulkDeleteSchema" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ id: channel_id });
	if (!channel.guild_id) throw new HTTPError("Can't bulk delete dm channel messages", 400);

	const permission = await getPermission(req.user_id, channel?.guild_id, channel_id);
	permission.hasThrow("MANAGE_MESSAGES");

	const { maxBulkDelete } = Config.get().limits.message;

	const { messages } = req.body as { messages: string[] };
	if (messages.length < 2) throw new HTTPError("You must at least specify 2 messages to bulk delete");
	if (messages.length > maxBulkDelete) throw new HTTPError(`You cannot delete more than ${maxBulkDelete} messages`);

	await Message.delete(messages.map((x) => ({ id: x })));

	await emitEvent({
		event: "MESSAGE_DELETE_BULK",
		channel_id,
		data: { ids: messages, channel_id, guild_id: channel.guild_id }
	} as MessageDeleteBulkEvent);

	res.sendStatus(204);
});
