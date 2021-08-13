import { ChannelModel, Embed, emitEvent, Message, MessageCreateEvent, MessageUpdateEvent } from "@fosscord/util";
import { Snowflake } from "@fosscord/util";
import { MessageModel } from "@fosscord/util";
import { PublicMemberProjection } from "@fosscord/util";
import { toObject } from "@fosscord/util";
import { getPermission } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import fetch from "node-fetch";
import cheerio from "cheerio";

import { MessageType } from "@fosscord/util/dist/util/Constants";
// TODO: check webhook, application, system author

const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

const DEFAULT_FETCH_OPTIONS: any = {
	redirect: "follow",
	follow: 1,
	headers: {
		"user-agent": "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)"
	},
	size: 1024 * 1024 * 1,
	compress: true,
	method: "GET"
};

export async function handleMessage(opts: Partial<Message>) {
	const channel = await ChannelModel.findOne(
		{ id: opts.channel_id },
		{ guild_id: true, type: true, permission_overwrites: true, recipient_ids: true, owner_id: true }
	)
		.lean() // lean is needed, because we don't want to populate .recipients that also auto deletes .recipient_ids
		.exec();
	if (!channel || !opts.channel_id) throw new HTTPError("Channel not found", 404);
	// TODO: are tts messages allowed in dm channels? should permission be checked?

	// @ts-ignore
	const permissions = await getPermission(opts.author_id, channel.guild_id, opts.channel_id, { channel });
	permissions.hasThrow("SEND_MESSAGES");
	if (opts.tts) permissions.hasThrow("SEND_TTS_MESSAGES");
	if (opts.message_reference) {
		permissions.hasThrow("READ_MESSAGE_HISTORY");
		if (opts.message_reference.guild_id !== channel.guild_id) throw new HTTPError("You can only reference messages from this guild");
		if (opts.message_reference.channel_id !== opts.channel_id) throw new HTTPError("You can only reference messages from this channel");
		// TODO: should be checked if the referenced message exists?
		// @ts-ignore
		opts.type = MessageType.REPLY;
	}

	if (!opts.content && !opts.embeds?.length && !opts.attachments?.length && !opts.stickers?.length && !opts.activity) {
		throw new HTTPError("Empty messages are not allowed", 50006);
	}

	// TODO: check and put it all in the body
	return {
		...opts,
		guild_id: channel.guild_id,
		channel_id: opts.channel_id,
		// TODO: generate mentions and check permissions
		mention_channels_ids: [],
		mention_role_ids: [],
		mention_user_ids: [],
		attachments: opts.attachments || [], // TODO: message attachments
		embeds: opts.embeds || [],
		reactions: opts.reactions || [],
		type: opts.type ?? 0
	};
}

// TODO: cache link result in db
export async function postHandleMessage(message: Message) {
	var links = message.content?.match(LINK_REGEX);
	if (!links) return;

	const data = { ...message };
	data.embeds = data.embeds.filter((x) => x.type !== "link");

	links = links.slice(0, 5); // embed max 5 links

	for (const link of links) {
		try {
			const request = await fetch(link, DEFAULT_FETCH_OPTIONS);

			const text = await request.text();
			const $ = cheerio.load(text);

			const title = $('meta[property="og:title"]').attr("content");
			const provider_name = $('meta[property="og:site_name"]').text();
			const author_name = $('meta[property="article:author"]').attr("content");
			const description = $('meta[property="og:description"]').attr("content") || $('meta[property="description"]').attr("content");
			const image = $('meta[property="og:image"]').attr("content");
			const url = $('meta[property="og:url"]').attr("content");
			// TODO: color
			const embed: Embed = {
				provider: {
					url: link,
					name: provider_name
				}
			};

			if (author_name) embed.author = { name: author_name };
			if (image) embed.thumbnail = { proxy_url: image, url: image };
			if (title) embed.title = title;
			if (url) embed.url = url;
			if (description) embed.description = description;

			if (title || description) {
				data.embeds.push(embed);
			}
		} catch (error) {}
	}

	await Promise.all([
		emitEvent({
			event: "MESSAGE_UPDATE",
			guild_id: message.guild_id,
			channel_id: message.channel_id,
			data
		} as MessageUpdateEvent),
		MessageModel.updateOne({ id: message.id, channel_id: message.channel_id }, data).exec()
	]);
}

export async function sendMessage(opts: Partial<Message>) {
	const message = await handleMessage({ ...opts, id: Snowflake.generate(), timestamp: new Date() });

	const data = toObject(
		await new MessageModel(message).populate({ path: "member", select: PublicMemberProjection }).populate("referenced_message").save()
	);

	await emitEvent({ event: "MESSAGE_CREATE", channel_id: opts.channel_id, data, guild_id: message.guild_id } as MessageCreateEvent);

	postHandleMessage(data).catch((e) => {}); // no await as it shouldnt block the message send function and silently catch error

	return data;
}
