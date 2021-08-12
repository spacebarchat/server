import {
	ChannelCreateEvent,
	ChannelModel,
	ChannelType,
	getPermission,
	GuildModel,
	Snowflake,
	TextChannel,
	VoiceChannel
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "./Event";

// TODO: DM channel
export async function createChannel(channel: Partial<TextChannel | VoiceChannel>, user_id: string = "0") {

	// Always check if user has permission first
	const permissions = await getPermission(user_id, channel.guild_id);
	permissions.hasThrow("MANAGE_CHANNELS");

	switch (channel.type) {
		case ChannelType.GUILD_TEXT:
		case ChannelType.GUILD_VOICE:
			if (channel.parent_id) {
				const exists = await ChannelModel.findOne({ id: channel.parent_id }, { guild_id: true }).exec();
				if (!exists) throw new HTTPError("Parent id channel doesn't exist", 400);
				if (exists.guild_id !== channel.guild_id) throw new HTTPError("The category channel needs to be in the guild");
			}
			break;
		case ChannelType.GUILD_CATEGORY:
			break;
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
			throw new HTTPError("You can't create a dm channel in a guild");
		// TODO: check if guild is community server
		case ChannelType.GUILD_STORE:
		case ChannelType.GUILD_NEWS:
		default:
			throw new HTTPError("Not yet supported");
	}

	if (!channel.permission_overwrites) channel.permission_overwrites = [];
	// TODO: auto generate position

	channel = await new ChannelModel({
		...channel,
		id: Snowflake.generate(),
		created_at: new Date(),
		// @ts-ignore
		recipient_ids: null
	}).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: channel, guild_id: channel.guild_id } as ChannelCreateEvent);

	return channel;
}
