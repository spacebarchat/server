import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { getPermission, FieldErrors, Message, Channel } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { FindManyOptions, In, Like } from "typeorm";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const {
		channel_id,
		content,
		include_nsfw, // TODO
		offset,
		sort_order,
		sort_by, // TODO: Handle 'relevance'
		limit,
		author_id,
	} = req.query;

	const parsedLimit = Number(limit) || 50;
	if (parsedLimit < 1 || parsedLimit > 100)
		throw new HTTPError("limit must be between 1 and 100", 422);

	if (sort_order) {
		if (
			typeof sort_order != "string" ||
			["desc", "asc"].indexOf(sort_order) == -1
		)
			throw FieldErrors({
				sort_order: {
					message: "Value must be one of ('desc', 'asc').",
					code: "BASE_TYPE_CHOICES",
				},
			}); // todo this is wrong
	}

	const permissions = await getPermission(
		req.user_id,
		req.params.guild_id,
		channel_id as string | undefined,
	);
	permissions.hasThrow("VIEW_CHANNEL");
	if (!permissions.has("READ_MESSAGE_HISTORY"))
		return res.json({ messages: [], total_results: 0 });

	let query: FindManyOptions<Message> = {
		order: {
			timestamp: sort_order
				? (sort_order.toUpperCase() as "ASC" | "DESC")
				: "DESC",
		},
		take: parsedLimit || 0,
		where: {
			guild: {
				id: req.params.guild_id,
			},
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
		skip: offset ? Number(offset) : 0,
	};
	//@ts-ignore
	if (channel_id) query.where!.channel = { id: channel_id };
	else {
		// get all channel IDs that this user can access
		const channels = await Channel.find({
			where: { guild_id: req.params.guild_id },
			select: ["id"],
		});
		const ids = [];

		for (let channel of channels) {
			const perm = await getPermission(
				req.user_id,
				req.params.guild_id,
				channel.id,
			);
			if (!perm.has("VIEW_CHANNEL") || !perm.has("READ_MESSAGE_HISTORY"))
				continue;
			ids.push(channel.id);
		}

		//@ts-ignore
		query.where!.channel = { id: In(ids) };
	}
	//@ts-ignore
	if (author_id) query.where!.author = { id: author_id };
	//@ts-ignore
	if (content) query.where!.content = Like(`%${content}%`);

	const messages: Message[] = await Message.find(query);

	const messagesDto = messages.map((x) => [
		{
			id: x.id,
			type: x.type,
			content: x.content,
			channel_id: x.channel_id,
			author: {
				id: x.author?.id,
				username: x.author?.username,
				avatar: x.author?.avatar,
				avatar_decoration: null,
				discriminator: x.author?.discriminator,
				public_flags: x.author?.public_flags,
			},
			attachments: x.attachments,
			embeds: x.embeds,
			mentions: x.mentions,
			mention_roles: x.mention_roles,
			pinned: x.pinned,
			mention_everyone: x.mention_everyone,
			tts: x.tts,
			timestamp: x.timestamp,
			edited_timestamp: x.edited_timestamp,
			flags: x.flags,
			components: x.components,
			hit: true,
		},
	]);

	return res.json({
		messages: messagesDto,
		total_results: messages.length,
	});
});

export default router;
