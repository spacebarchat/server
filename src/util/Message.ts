import { ChannelModel, MessageCreateEvent } from "@fosscord/server-util";
import { Snowflake } from "@fosscord/server-util";
import { MessageModel } from "@fosscord/server-util";
import { PublicMemberProjection } from "@fosscord/server-util";
import { toObject } from "@fosscord/server-util";
import { getPermission } from "@fosscord/server-util";
import { Message } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "./Event";
// TODO: check webhook, application, system author

export async function handleMessage(opts: Partial<Message>) {
	const channel = await ChannelModel.findOne({ id: opts.channel_id }, { guild_id: true, type: true, permission_overwrites: true }).exec();
	if (!channel || !opts.channel_id) throw new HTTPError("Channel not found", 404);
	// TODO: are tts messages allowed in dm channels? should permission be checked?

	const permissions = await getPermission(opts.author_id, channel.guild_id, opts.channel_id, { channel });
	permissions.hasThrow("SEND_MESSAGES");
	if (opts.tts) permissions.hasThrow("SEND_TTS_MESSAGES");
	if (opts.message_reference) {
		permissions.hasThrow("READ_MESSAGE_HISTORY");
		if (opts.message_reference.guild_id !== channel.guild_id) throw new HTTPError("You can only reference messages from this guild");
	}

	if (opts.message_reference) {
		if (opts.message_reference.channel_id !== opts.channel_id) throw new HTTPError("You can only reference messages from this channel");
		// TODO: should be checked if the referenced message exists?
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
		attachments: [], // TODO: message attachments
		embeds: opts.embeds || [],
		reactions: opts.reactions || [],
		type: opts.type ?? 0
	};
}

export async function sendMessage(opts: Partial<Message>) {
	const message = await handleMessage({ ...opts, id: Snowflake.generate(), timestamp: new Date() });

	const data = toObject(await new MessageModel(message).populate({ path: "member", select: PublicMemberProjection }).save());

	await emitEvent({ event: "MESSAGE_CREATE", channel_id: opts.channel_id, data, guild_id: message.guild_id } as MessageCreateEvent);

	return data;
}
