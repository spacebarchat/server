import {
	Channel,
	Embed,
	emitEvent,
	Guild,
	Message,
	MessageCreateEvent,
	MessageUpdateEvent,
	getPermission,
	getRights,
	CHANNEL_MENTION,
	USER_MENTION,
	ROLE_MENTION,
	Role,
	EVERYONE_MENTION,
	HERE_MENTION,
	MessageType,
	User,
	Application,
	Webhook,
	Attachment,
	Config,
	Sticker,
	MessageCreateSchema,
	EmbedCache,
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";
import { EmbedHandlers } from "@fosscord/api";
import * as Sentry from "@sentry/node";
const allow_empty = false;
// TODO: check webhook, application, system author, stickers
// TODO: embed gifs/videos/images

const LINK_REGEX =
	/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

export async function handleMessage(opts: MessageOptions): Promise<Message> {
	const channel = await Channel.findOneOrFail({
		where: { id: opts.channel_id },
		relations: ["recipients"],
	});
	if (!channel || !opts.channel_id)
		throw new HTTPError("Channel not found", 404);

	const stickers = opts.sticker_ids
		? await Sticker.find({ where: { id: In(opts.sticker_ids) } })
		: undefined;
	const message = Message.create({
		...opts,
		sticker_items: stickers,
		guild_id: channel.guild_id,
		channel_id: opts.channel_id,
		attachments: opts.attachments || [],
		embeds: opts.embeds || [],
		reactions: /*opts.reactions ||*/ [],
		type: opts.type ?? 0,
	});

	if (
		message.content &&
		message.content.length > Config.get().limits.message.maxCharacters
	) {
		throw new HTTPError("Content length over max character limit");
	}

	if (opts.author_id) {
		message.author = await User.getPublicUser(opts.author_id);
		const rights = await getRights(opts.author_id);
		rights.hasThrow("SEND_MESSAGES");
	}
	if (opts.application_id) {
		message.application = await Application.findOneOrFail({
			where: { id: opts.application_id },
		});
	}
	if (opts.webhook_id) {
		message.webhook = await Webhook.findOneOrFail({
			where: { id: opts.webhook_id },
		});
	}

	const permission = await getPermission(
		opts.author_id,
		channel.guild_id,
		opts.channel_id,
	);
	permission.hasThrow("SEND_MESSAGES");
	if (permission.cache.member) {
		message.member = permission.cache.member;
	}

	if (opts.tts) permission.hasThrow("SEND_TTS_MESSAGES");
	if (opts.message_reference) {
		permission.hasThrow("READ_MESSAGE_HISTORY");
		// code below has to be redone when we add custom message routing
		if (message.guild_id !== null) {
			const guild = await Guild.findOneOrFail({
				where: { id: channel.guild_id },
			});
			if (!guild.features.includes("CROSS_CHANNEL_REPLIES")) {
				if (opts.message_reference.guild_id !== channel.guild_id)
					throw new HTTPError(
						"You can only reference messages from this guild",
					);
				if (opts.message_reference.channel_id !== opts.channel_id)
					throw new HTTPError(
						"You can only reference messages from this channel",
					);
			}
		}
		/** Q: should be checked if the referenced message exists? ANSWER: NO
		 otherwise backfilling won't work **/
		// @ts-ignore
		message.type = MessageType.REPLY;
	}

	// TODO: stickers/activity
	if (
		!allow_empty &&
		!opts.content &&
		!opts.embeds?.length &&
		!opts.attachments?.length &&
		!opts.sticker_ids?.length
	) {
		throw new HTTPError("Empty messages are not allowed", 50006);
	}

	var content = opts.content;
	var mention_channel_ids = [] as string[];
	var mention_role_ids = [] as string[];
	var mention_user_ids = [] as string[];
	var mention_everyone = false;

	if (content) {
		// TODO: explicit-only mentions
		message.content = content.trim();
		content = content.replace(/ *\`[^)]*\` */g, ""); // remove codeblocks
		for (const [_, mention] of content.matchAll(CHANNEL_MENTION)) {
			if (!mention_channel_ids.includes(mention))
				mention_channel_ids.push(mention);
		}

		for (const [_, mention] of content.matchAll(USER_MENTION)) {
			if (!mention_user_ids.includes(mention))
				mention_user_ids.push(mention);
		}

		await Promise.all(
			Array.from(content.matchAll(ROLE_MENTION)).map(
				async ([_, mention]) => {
					const role = await Role.findOneOrFail({
						where: { id: mention, guild_id: channel.guild_id },
					});
					if (role.mentionable || permission.has("MANAGE_ROLES")) {
						mention_role_ids.push(mention);
					}
				},
			),
		);

		if (permission.has("MENTION_EVERYONE")) {
			mention_everyone =
				!!content.match(EVERYONE_MENTION) ||
				!!content.match(HERE_MENTION);
		}
	}

	message.mention_channels = mention_channel_ids.map((x) =>
		Channel.create({ id: x }),
	);
	message.mention_roles = mention_role_ids.map((x) => Role.create({ id: x }));
	message.mentions = mention_user_ids.map((x) => User.create({ id: x }));
	message.mention_everyone = mention_everyone;

	// TODO: check and put it all in the body

	return message;
}

// TODO: cache link result in db
export async function postHandleMessage(message: Message) {
	const content = message.content?.replace(/ *\`[^)]*\` */g, ""); // remove markdown
	var links = content?.match(LINK_REGEX);
	if (!links) return;

	const data = { ...message };
	data.embeds = data.embeds.filter((x) => x.type !== "link");

	links = links.slice(0, 20) as RegExpMatchArray; // embed max 20 links — TODO: make this configurable with instance policies

	const cachePromises = [];

	for (const link of links) {
		const url = new URL(link);

		const cached = await EmbedCache.findOne({ where: { url: link } });
		if (cached) {
			data.embeds.push(cached.embed);
			continue;
		}

		// bit gross, but whatever!
		const endpointPublic =
			Config.get().cdn.endpointPublic || "http://127.0.0.1"; // lol
		const handler =
			url.hostname == new URL(endpointPublic).hostname
				? EmbedHandlers["self"]
				: EmbedHandlers[url.hostname] || EmbedHandlers["default"];

		try {
			let res = await handler(url);
			if (!res) continue;
			// tried to use shorthand but types didn't like me L
			if (!Array.isArray(res)) res = [res];

			for (var embed of res) {
				var cache = EmbedCache.create({
					url: link,
					embed: embed,
				});
				cachePromises.push(cache.save());
				data.embeds.push(embed);
			}
		} catch (e) {
			console.error(`[Embeds] Error while generating embed`, e);
			Sentry.captureException(e, (scope) => {
				scope.clear();
				scope.setContext("request", { url });
				return scope;
			});
			continue;
		}
	}

	if (!data.embeds) return;

	await Promise.all([
		emitEvent({
			event: "MESSAGE_UPDATE",
			channel_id: message.channel_id,
			data,
		} as MessageUpdateEvent),
		Message.update(
			{ id: message.id, channel_id: message.channel_id },
			{ embeds: data.embeds },
		),
		...cachePromises,
	]);
}

export async function sendMessage(opts: MessageOptions) {
	const message = await handleMessage({ ...opts, timestamp: new Date() });

	await Promise.all([
		Message.insert(message),
		emitEvent({
			event: "MESSAGE_CREATE",
			channel_id: opts.channel_id,
			data: message.toJSON(),
		} as MessageCreateEvent),
	]);

	postHandleMessage(message).catch((e) => {}); // no await as it should catch error non-blockingly

	return message;
}

interface MessageOptions extends MessageCreateSchema {
	id?: string;
	type?: MessageType;
	pinned?: boolean;
	author_id?: string;
	webhook_id?: string;
	application_id?: string;
	embeds?: Embed[];
	channel_id?: string;
	attachments?: Attachment[];
	edited_timestamp?: Date;
	timestamp?: Date;
}
