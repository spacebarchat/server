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
	Snowflake,
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
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import fetch from "node-fetch";
import cheerio from "cheerio";
import { MessageCreateSchema } from "../../routes/channels/#channel_id/messages";
const allow_empty = false;
// TODO: check webhook, application, system author, stickers
// TODO: embed gifs/videos/images

const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

const DEFAULT_FETCH_OPTIONS: any = {
	redirect: "follow",
	follow: 1,
	headers: {
		"user-agent": "Mozilla/5.0 (compatible; Fosscord/1.0; +https://github.com/fosscord/fosscord)"
	},
	// size: 1024 * 1024 * 5, 	// grabbed from config later
	compress: true,
	method: "GET"
};

export async function handleMessage(opts: MessageOptions): Promise<Message> {
	const channel = await Channel.findOneOrFail({ where: { id: opts.channel_id }, relations: ["recipients"] });
	if (!channel || !opts.channel_id) throw new HTTPError("Channel not found", 404);

	const message = new Message({
		...opts,
		sticker_items: opts.sticker_ids?.map((x) => ({ id: x })),
		guild_id: channel.guild_id,
		channel_id: opts.channel_id,
		attachments: opts.attachments || [],
		embeds: opts.embeds || [],
		reactions: /*opts.reactions ||*/[],
		type: opts.type ?? 0,
		edited_timestamp: null
	});

	if (message.content && message.content.length > Config.get().limits.message.maxCharacters) {
		throw new HTTPError("Content length over max character limit");
	}

	if (opts.author_id) {
		message.author = await User.getPublicUser(opts.author_id);
		const rights = await getRights(opts.author_id);
		rights.hasThrow("SEND_MESSAGES");
	}
	if (opts.application_id) {
		message.application = await Application.findOneOrFail({ id: opts.application_id });
	}
	if (opts.webhook_id) {
		message.webhook = await Webhook.findOneOrFail({ id: opts.webhook_id });
	}

	const permission = await getPermission(opts.author_id, channel.guild_id, opts.channel_id);
	permission.hasThrow("SEND_MESSAGES");
	if (permission.cache.member) {
		message.member = permission.cache.member;
	}

	if (opts.tts) permission.hasThrow("SEND_TTS_MESSAGES");
	if (opts.message_reference) {
		permission.hasThrow("READ_MESSAGE_HISTORY");
		// code below has to be redone when we add custom message routing
		if (message.guild_id !== null) {
			const guild = await Guild.findOneOrFail({ id: channel.guild_id });
			if (!guild.features.includes("CROSS_CHANNEL_REPLIES")) {
				if (opts.message_reference.guild_id !== channel.guild_id) throw new HTTPError("You can only reference messages from this guild");
				if (opts.message_reference.channel_id !== opts.channel_id) throw new HTTPError("You can only reference messages from this channel");
			}
		}
		/** Q: should be checked if the referenced message exists? ANSWER: NO
		 otherwise backfilling won't work **/
		// @ts-ignore
		message.type = MessageType.REPLY;
	}

	// TODO: stickers/activity
	if (!allow_empty && (!opts.content && !opts.embeds?.length && !opts.attachments?.length && !opts.sticker_ids?.length)) {
		throw new HTTPError("Empty messages are not allowed", 50006);
	}

	var content = opts.content;
	var mention_channel_ids = [] as string[];
	var mention_role_ids = [] as string[];
	var mention_user_ids = [] as string[];
	var mention_everyone = false;

	if (content) { // TODO: explicit-only mentions
		message.content = content.trim();
		for (const [_, mention] of content.matchAll(CHANNEL_MENTION)) {
			if (!mention_channel_ids.includes(mention)) mention_channel_ids.push(mention);
		}

		for (const [_, mention] of content.matchAll(USER_MENTION)) {
			if (!mention_user_ids.includes(mention)) mention_user_ids.push(mention);
		}

		await Promise.all(
			Array.from(content.matchAll(ROLE_MENTION)).map(async ([_, mention]) => {
				const role = await Role.findOneOrFail({ id: mention, guild_id: channel.guild_id });
				if (role.mentionable || permission.has("MANAGE_ROLES")) {
					mention_role_ids.push(mention);
				}
			})
		);

		if (permission.has("MENTION_EVERYONE")) {
			mention_everyone = !!content.match(EVERYONE_MENTION) || !!content.match(HERE_MENTION);
		}
	}

	message.mention_channels = mention_channel_ids.map((x) => new Channel({ id: x }));
	message.mention_roles = mention_role_ids.map((x) => new Role({ id: x }));
	message.mentions = mention_user_ids.map((x) => new User({ id: x }));
	message.mention_everyone = mention_everyone;

	// TODO: check and put it all in the body

	return message;
}

// TODO: cache link result in db
export async function postHandleMessage(message: Message) {
	var links = message.content?.match(LINK_REGEX);
	if (!links) return;

	const data = { ...message };
	data.embeds = data.embeds.filter((x) => x.type !== "link");

	links = links.slice(0, 20); // embed max 20 links — TODO: make this configurable with instance policies

	const { endpointPublic, resizeWidthMax, resizeHeightMax } = Config.get().cdn;

	for (const link of links) {
		try {
			const request = await fetch(link, {
				...DEFAULT_FETCH_OPTIONS,
				size: Config.get().limits.message.maxEmbedDownloadSize,
			});

			let embed: Embed;

			const type = request.headers.get("content-type");
			if (type?.indexOf("image") == 0) {
				embed = {
					provider: {
						url: link,
						name: new URL(link).hostname,
					},
					image: {
						// can't be bothered rn
						proxy_url: `${endpointPublic}/external/resize/${encodeURIComponent(link)}?width=500&height=400`,
						url: link,
						width: 500,
						height: 400
					}
				};
				data.embeds.push(embed);
			}
			else {
				const text = await request.text();
				const $ = cheerio.load(text);

				const title = $('meta[property="og:title"]').attr("content");
				const provider_name = $('meta[property="og:site_name"]').text();
				const author_name = $('meta[property="article:author"]').attr("content");
				const description = $('meta[property="og:description"]').attr("content") || $('meta[property="description"]').attr("content");

				const image = $('meta[property="og:image"]').attr("content");
				const width = parseInt($('meta[property="og:image:width"]').attr("content") || "") || undefined;
				const height = parseInt($('meta[property="og:image:height"]').attr("content") || "") || undefined;

				const url = $('meta[property="og:url"]').attr("content");
				// TODO: color
				embed = {
					provider: {
						url: link,
						name: provider_name
					}
				};

				const resizeWidth = Math.min(resizeWidthMax ?? 1, width ?? 100);
				const resizeHeight = Math.min(resizeHeightMax ?? 1, height ?? 100);
				if (author_name) embed.author = { name: author_name };
				if (image) embed.thumbnail = {
					proxy_url: `${endpointPublic}/external/resize/${encodeURIComponent(image)}?width=${resizeWidth}&height=${resizeHeight}`,
					url: image,
					width: width,
					height: height
				};
				if (title) embed.title = title;
				if (url) embed.url = url;
				if (description) embed.description = description;

				const approvedProviders = [
					"media4.giphy.com",
					"c.tenor.com",
					// todo: make configurable? don't really care tho
				];

				// very bad code below
				// don't care lol
				if (embed?.thumbnail?.url && approvedProviders.indexOf(new URL(embed.thumbnail.url).hostname) !== -1) {
					embed = {
						provider: {
							url: link,
							name: new URL(link).hostname,
						},
						image: {
							proxy_url: `${endpointPublic}/external/resize/${encodeURIComponent(image!)}?width=${resizeWidth}&height=${resizeHeight}`,
							url: image,
							width: width,
							height: height
						}
					};
				}

				if (title || description) {
					data.embeds.push(embed);
				}
			}
		} catch (error) { }
	}

	await Promise.all([
		emitEvent({
			event: "MESSAGE_UPDATE",
			channel_id: message.channel_id,
			data
		} as MessageUpdateEvent),
		Message.update({ id: message.id, channel_id: message.channel_id }, { embeds: data.embeds })
	]);
}

export async function sendMessage(opts: MessageOptions) {
	const message = await handleMessage({ ...opts, timestamp: new Date() });

	await Promise.all([
		Message.insert(message),
		emitEvent({ event: "MESSAGE_CREATE", channel_id: opts.channel_id, data: message.toJSON() } as MessageCreateEvent)
	]);

	postHandleMessage(message).catch((e) => { }); // no await as it should catch error non-blockingly

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
	edited_timestamp: Date | null;
	timestamp?: Date;
}
