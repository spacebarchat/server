import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import { isTextChannel } from "./messages";
import { FindManyOptions, Between, Not } from "typeorm";
import {
	Channel,
	Config,
	emitEvent,
	getPermission,
	getRights,
	Message,
	MessageDeleteBulkEvent,
	PurgeSchema,
} from "@fosscord/util";
import { Router, Response, Request } from "express";

const router: Router = Router();

export default router;

/**
TODO: apply the delete bit by bit to prevent client and database stress
**/
router.post(
	"/",
	route({
		/*body: "PurgeSchema",*/
	}),
	async (req: Request, res: Response) => {
		const { channel_id } = req.params;
		const channel = await Channel.findOneOrFail({
			where: { id: channel_id },
		});

		if (!channel.guild_id)
			throw new HTTPError("Can't purge dm channels", 400);
		isTextChannel(channel.type);

		const rights = await getRights(req.user_id);
		if (!rights.has("MANAGE_MESSAGES")) {
			const permissions = await getPermission(
				req.user_id,
				channel.guild_id,
				channel_id,
			);
			permissions.hasThrow("MANAGE_MESSAGES");
			permissions.hasThrow("MANAGE_CHANNELS");
		}

		const { before, after } = req.body as PurgeSchema;

		// TODO: send the deletion event bite-by-bite to prevent client stress

		var query: FindManyOptions<Message> & { where: { id?: any } } = {
			order: { id: "ASC" },
			// take: limit,
			where: {
				channel_id,
				id: Between(after, before), // the right way around
				author_id: rights.has("SELF_DELETE_MESSAGES")
					? undefined
					: Not(req.user_id),
				// if you lack the right of self-deletion, you can't delete your own messages, even in purges
			},
			relations: [
				"author",
				"webhook",
				"application",
				"mentions",
				"mention_roles",
				"mention_channels",
				"sticker_items",
				"attachments",
			],
		};

		const messages = await Message.find(query);
		const endpoint = Config.get().cdn.endpointPublic;

		if (messages.length == 0) {
			res.sendStatus(304);
			return;
		}

		await Message.delete(messages.map((x) => x.id));

		await emitEvent({
			event: "MESSAGE_DELETE_BULK",
			channel_id,
			data: {
				ids: messages.map((x) => x.id),
				channel_id,
				guild_id: channel.guild_id,
			},
		} as MessageDeleteBulkEvent);

		res.sendStatus(204);
	},
);
