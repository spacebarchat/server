import {
	ChannelModel,
	EmojiModel,
	getPermission,
	MemberModel,
	MessageModel,
	MessageReactionAddEvent,
	MessageReactionRemoveAllEvent,
	MessageReactionRemoveEmojiEvent,
	MessageReactionRemoveEvent,
	PartialEmoji,
	PublicUserProjection,
	toObject,
	UserModel
} from "@fosscord/server-util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../../../util/Event";

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

router.delete("/", async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true }).exec();

	const permissions = await getPermission(req.user_id, undefined, channel_id);
	permissions.hasThrow("MANAGE_MESSAGES");

	await MessageModel.findOneAndUpdate({ id: message_id, channel_id }, { reactions: [] }).exec();

	await emitEvent({
		event: "MESSAGE_REACTION_REMOVE_ALL",
		channel_id,
		guild_id: channel.guild_id,
		data: {
			channel_id,
			message_id,
			guild_id: channel.guild_id
		}
	} as MessageReactionRemoveAllEvent);

	res.sendStatus(204);
});

router.delete("/:emoji", async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;
	const emoji = getEmoji(req.params.emoji);

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true }).exec();

	const permissions = await getPermission(req.user_id, undefined, channel_id);
	permissions.hasThrow("MANAGE_MESSAGES");

	const message = await MessageModel.findOne({ id: message_id, channel_id }).exec();

	const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
	if (!already_added) throw new HTTPError("Reaction not found", 404);
	message.reactions.remove(already_added);

	await MessageModel.updateOne({ id: message_id, channel_id }, message).exec();

	await emitEvent({
		event: "MESSAGE_REACTION_REMOVE_EMOJI",
		channel_id,
		guild_id: channel.guild_id,
		data: {
			channel_id,
			message_id,
			guild_id: channel.guild_id,
			emoji
		}
	} as MessageReactionRemoveEmojiEvent);

	res.sendStatus(204);
});

router.get("/:emoji", async (req: Request, res: Response) => {
	const { message_id, channel_id } = req.params;
	const emoji = getEmoji(req.params.emoji);

	const message = await MessageModel.findOne({ id: message_id, channel_id }).exec();
	if (!message) throw new HTTPError("Message not found", 404);
	const reaction = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
	if (!reaction) throw new HTTPError("Reaction not found", 404);

	const permissions = await getPermission(req.user_id, undefined, channel_id);
	permissions.hasThrow("VIEW_CHANNEL");

	const users = await UserModel.find({ id: { $in: reaction.user_ids } }, PublicUserProjection).exec();

	res.json(toObject(users));
});

router.put("/:emoji/:user_id", async (req: Request, res: Response) => {
	const { message_id, channel_id, user_id } = req.params;
	if (user_id !== "@me") throw new HTTPError("Invalid user");
	const emoji = getEmoji(req.params.emoji);

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true }).exec();
	const message = await MessageModel.findOne({ id: message_id, channel_id }).exec();
	const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);

	const permissions = await getPermission(req.user_id, undefined, channel_id);
	permissions.hasThrow("READ_MESSAGE_HISTORY");
	if (!already_added) permissions.hasThrow("ADD_REACTIONS");

	if (emoji.id) {
		const external_emoji = await EmojiModel.findOne({ id: emoji.id }).exec();
		if (!already_added) permissions.hasThrow("USE_EXTERNAL_EMOJIS");
		emoji.animated = external_emoji.animated;
		emoji.name = external_emoji.name;
	}

	if (already_added) {
		if (already_added.user_ids.includes(req.user_id)) return res.sendStatus(204); // Do not throw an error ¯\_(ツ)_/¯ as discord also doesn't throw any error
		already_added.count++;
	} else message.reactions.push({ count: 1, emoji, user_ids: [req.user_id] });

	await MessageModel.updateOne({ id: message_id, channel_id }, message).exec();

	const member = channel.guild_id && (await MemberModel.findOne({ id: req.user_id }).exec());

	await emitEvent({
		event: "MESSAGE_REACTION_ADD",
		channel_id,
		guild_id: channel.guild_id,
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

router.delete("/:emoji/:user_id", async (req: Request, res: Response) => {
	var { message_id, channel_id, user_id } = req.params;

	const emoji = getEmoji(req.params.emoji);

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true }).exec();
	const message = await MessageModel.findOne({ id: message_id, channel_id }).exec();

	const permissions = await getPermission(req.user_id, undefined, channel_id);

	if (user_id === "@me") user_id = req.user_id;
	else permissions.hasThrow("MANAGE_MESSAGES");

	const already_added = message.reactions.find((x) => (x.emoji.id === emoji.id && emoji.id) || x.emoji.name === emoji.name);
	if (!already_added || !already_added.user_ids.includes(user_id)) throw new HTTPError("Reaction not found", 404);

	already_added.count--;

	if (already_added.count <= 0) message.reactions.remove(already_added);

	await MessageModel.updateOne({ id: message_id, channel_id }, message).exec();

	await emitEvent({
		event: "MESSAGE_REACTION_REMOVE",
		channel_id,
		guild_id: channel.guild_id,
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
