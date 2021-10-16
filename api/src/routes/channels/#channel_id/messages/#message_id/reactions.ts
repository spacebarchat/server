import {
	Channel,
	emitEvent,
	Emoji,
	getPermission,
	Member,
	Message,
	MessageReactionAddEvent,
	MessageReactionRemoveAllEvent,
	MessageReactionRemoveEmojiEvent,
	MessageReactionRemoveEvent,
	PartialEmoji,
	PublicUserProjection,
	User
} from "@fosscord/util";
import { route } from "@fosscord/api";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";

const router = Router();
// TODO: check if emoji is really an unicode emoji or a prperly encoded external emoji

function getEmoji(emoji: string): PartialEmoji {
	emoji = decodeURIComponent(emoji);
	const parts = emoji.includes(":") && emoji.split(":");
	if (parts)
		return {
			name: parts[0],
			id: parts[1]
		};

	return {
		id: undefined,
		name: emoji
	};
}

router.delete("/", route({ permission: "MANAGE_MESSAGES" }), async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ id: channel_id });

	await Message.update({ id: message_id, channel_id }, { reactions: [] });

	await emitEvent({
		event: "MESSAGE_REACTION_REMOVE_ALL",
		channel_id,
		data: {
			channel_id,
			message_id,
			guild_id: channel.guild_id
		}
	} as MessageReactionRemoveAllEvent);

	res.sendStatus(204);
});

router.delete("/:emoji", route({ permission: "MANAGE_MESSAGES" }), async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;
	const emoji = getEmoji(req.params.emoji);

	const message = await Message.findOneOrFail({ id: message_id, channel_id });

	const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
	if (!already_added) throw new HTTPError("Reaction not found", 404);
	message.reactions.remove(already_added);

	await Promise.all([
		message.save(),
		emitEvent({
			event: "MESSAGE_REACTION_REMOVE_EMOJI",
			channel_id,
			data: {
				channel_id,
				message_id,
				guild_id: message.guild_id,
				emoji
			}
		} as MessageReactionRemoveEmojiEvent)
	]);

	res.sendStatus(204);
});

router.get("/:emoji", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;
	const emoji = getEmoji(req.params.emoji);

	const message = await Message.findOneOrFail({ id: message_id, channel_id });
	const reaction = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
	if (!reaction) throw new HTTPError("Reaction not found", 404);

	const users = await User.find({
		where: {
			id: In(reaction.user_ids)
		},
		select: PublicUserProjection
	});

	res.json(users);
});

router.put("/:emoji/:user_id", route({ permission: "READ_MESSAGE_HISTORY" }), async (req: Request, res: Response) => {
	const { message_id, channel_id, user_id } = req.params;
	if (user_id !== "@me") throw new HTTPError("Invalid user");
	const emoji = getEmoji(req.params.emoji);

	const channel = await Channel.findOneOrFail({ id: channel_id });
	const message = await Message.findOneOrFail({ id: message_id, channel_id });
	const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);

	if (!already_added) req.permission!.hasThrow("ADD_REACTIONS");

	if (emoji.id) {
		const external_emoji = await Emoji.findOneOrFail({ id: emoji.id });
		if (!already_added) req.permission!.hasThrow("USE_EXTERNAL_EMOJIS");
		emoji.animated = external_emoji.animated;
		emoji.name = external_emoji.name;
	}

	if (already_added) {
		if (already_added.user_ids.includes(req.user_id)) return res.sendStatus(204); // Do not throw an error ¯\_(ツ)_/¯ as discord also doesn't throw any error
		already_added.count++;
	} else message.reactions.push({ count: 1, emoji, user_ids: [req.user_id] });

	await message.save();

	const member = channel.guild_id && (await Member.findOneOrFail({ id: req.user_id }));

	await emitEvent({
		event: "MESSAGE_REACTION_ADD",
		channel_id,
		data: {
			user_id: req.user_id,
			channel_id,
			message_id,
			guild_id: channel.guild_id,
			emoji,
			member
		}
	} as MessageReactionAddEvent);

	res.sendStatus(204);
});

router.delete("/:emoji/:user_id", route({}), async (req: Request, res: Response) => {
	var { message_id, channel_id, user_id } = req.params;

	const emoji = getEmoji(req.params.emoji);

	const channel = await Channel.findOneOrFail({ id: channel_id });
	const message = await Message.findOneOrFail({ id: message_id, channel_id });

	if (user_id === "@me") user_id = req.user_id;
	else {
		const permissions = await getPermission(req.user_id, undefined, channel_id);
		permissions.hasThrow("MANAGE_MESSAGES");
	}

	const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
	if (!already_added || !already_added.user_ids.includes(user_id)) throw new HTTPError("Reaction not found", 404);

	already_added.count--;

	if (already_added.count <= 0) message.reactions.remove(already_added);

	await message.save();

	await emitEvent({
		event: "MESSAGE_REACTION_REMOVE",
		channel_id,
		data: {
			user_id: req.user_id,
			channel_id,
			message_id,
			guild_id: channel.guild_id,
			emoji
		}
	} as MessageReactionRemoveEvent);

	res.sendStatus(204);
});

export default router;
