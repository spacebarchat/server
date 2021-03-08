import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";

export interface AnyChannel extends Channel, DMChannel, TextChannel, VoiceChannel {}

export interface ChannelDocument extends Document, AnyChannel {
	id: bigint;
}

export const ChannelSchema = new Schema({
	id: Types.Long,
	created_at: { type: Schema.Types.Date, required: true },
	name: { type: String, required: true },
	type: { type: Number, required: true },
	guild_id: Types.Long,
	owner_id: Types.Long,
	parent_id: Types.Long,
	recipients: [Types.Long],
	position: Number,
	last_message_id: Types.Long,
	last_pin_timestamp: Date,
	nsfw: Boolean,
	rate_limit_per_user: Number,
	topic: String,
	permission_overwrites: [
		{
			allow: Types.Long,
			deny: Types.Long,
			id: Types.Long,
			type: Number,
		},
	],
});

// @ts-ignore
export const ChannelModel = db.model<ChannelDocument>("Channel", ChannelSchema, "channels");

export interface Channel {
	id: bigint;
	created_at: Date;
	name: string;
	type: number;
}

export interface TextBasedChannel {
	last_message_id?: bigint;
	last_pin_timestamp?: number;
}

export interface GuildChannel extends Channel {
	guild_id: bigint;
	position: number;
	parent_id?: bigint;
	permission_overwrites: ChannelPermissionOverwrite[];
}

export interface ChannelPermissionOverwrite {
	allow: bigint;
	deny: bigint;
	id: bigint;
	type: ChannelPermissionOverwriteType;
}

export enum ChannelPermissionOverwriteType {
	role = 0,
	member = 1,
}

export interface VoiceChannel extends GuildChannel {}

export interface TextChannel extends GuildChannel, TextBasedChannel {
	nsfw: boolean;
	rate_limit_per_user: number;
	topic?: string;
}

export interface DMChannel extends Channel, TextBasedChannel {
	owner_id: bigint;
	recipients: bigint[];
}

export enum ChannelType {
	GUILD_TEXT = 0, // a text channel within a server
	DM = 1, // a direct message between users
	GUILD_VOICE = 2, // a voice channel within a server
	GROUP_DM = 3, // a direct message between multiple users
	GUILD_CATEGORY = 4, // an organizational category that contains up to 50 channels
	GUILD_NEWS = 5, // a channel that users can follow and crosspost into their own server
	GUILD_STORE = 6, // a channel in which game developers can sell their game on Discord
}
