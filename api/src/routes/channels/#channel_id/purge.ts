import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import { isTextChannel } from "./messages";
import { FindManyOptions, Between } from "typeorm";
import {
	Attachment,
	Channel,
	Config,
	Embed,
	DiscordApiErrors,
	emitEvent,
	FosscordApiErrors,
	getPermission,
	getRights,
 	Message,
	MessageDeleteBulkEvent,
	Snowflake,
	uploadFile 
} from "@fosscord/util";
import { Router, Response, Request } from "express";
import multer from "multer";
import { handleMessage, postHandleMessage } from "@fosscord/api";

const router: Router = Router();

export default router;

export interface PurgeSchema {
	before: string;
	after: string
}

// TODO: should users be able to bulk delete messages or only bots?
// TODO: should this request fail, if you provide messages older than 14 days/invalid ids?
// https://discord.com/developers/docs/resources/channel#bulk-delete-messages
router.post("/", route({ body: "PurgeSchema", right: "SELF_DELETE_MESSAGES" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const channel = await Channel.findOneOrFail({ id: channel_id });
	
	if (!channel.guild_id) throw new HTTPError("Can't purge dm channels", 400);
	isTextChannel(channel.type);

	const rights = await getRights(req.user_id);
	if (!rights.has("MANAGE_MESSAGES")) {
		const permissions = await getPermission(req.user_id, channel.guild_id, channel_id);
		permissions.hasThrow("MANAGE_MESSAGES");
		permissions.hasThrow("MANAGE_CHANNELS");
	}
	
	const { before, after } = req.body as PurgeSchema;

	// TODO: send the deletion event bite-by-bite to prevent client stress
	var query: FindManyOptions<Message> & { where: { id?: any; }; } = {
		order: { id: "ASC" },
		// take: limit,
		where: {
		 channel_id,
		 id: Between(after, before), // the right way around
		 },
		relations: ["author", "webhook", "application", "mentions", "mention_roles", "mention_channels", "sticker_items", "attachments"]
	};

	const messages = await Message.find(query);
	const endpoint = Config.get().cdn.endpointPublic;

	await Message.delete(messages.map((x) => ({ id: x })));
	
	await emitEvent({
		event: "MESSAGE_DELETE_BULK",
		channel_id,
		data: { ids: messages.map(x => x.id), channel_id, guild_id: channel.guild_id }
	} as MessageDeleteBulkEvent);

	res.sendStatus(204);
});
