import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";
import toBigInt from "../util/toBigInt";
import { PublicUserProjection, UserModel } from "./User";

// @ts-ignore
export interface AnyChannel extends Channel, DMChannel, TextChannel, VoiceChannel {
	recipient_ids: null | string[];
}

export interface ChannelDocument extends Document, AnyChannel {
	id: string;
}

export const ChannelSchema = new Schema({
	id: String,
	created_at: { type: Schema.Types.Date, required: true },
	name: String, // can't be required for dm channels
	type: { type: Number, required: true },
	guild_id: String,
	owner_id: String,
	parent_id: String,
	recipient_ids: [String],
	position: Number,
	last_message_id: String,
	last_pin_timestamp: Date,
	nsfw: Boolean,
	rate_limit_per_user: Number,
	topic: String,
	permission_overwrites: [
		{
			allow: { type: String, get: toBigInt },
			deny: { type: String, get: toBigInt },
			id: String,
			type: { type: Number },
		},
	],
});

ChannelSchema.virtual("recipients", {
	ref: UserModel,
	localField: "recipient_ids",
	foreignField: "id",
	justOne: false,
	autopopulate: { select: PublicUserProjection },
});

ChannelSchema.set("removeResponse", ["recipient_ids"]);

// @ts-ignore
export const ChannelModel = db.model<ChannelDocument>("Channel", ChannelSchema, "channels");

export interface Channel {
	id: string;
	created_at: Date;
	name: string;
	type: number;
}

export interface TextBasedChannel {
	last_message_id?: string;
	last_pin_timestamp?: number;
}

export interface GuildChannel extends Channel {
	guild_id: string;
	position: number;
	parent_id?: string;
	permission_overwrites: ChannelPermissionOverwrite[];
}

export interface ChannelPermissionOverwrite {
	allow: bigint; // for bitfields we use bigints
	deny: bigint; // for bitfields we use bigints
	id: string;
	type: ChannelPermissionOverwriteType;
}

export enum ChannelPermissionOverwriteType {
	role = 0,
	member = 1,
}

export interface VoiceChannel extends GuildChannel {
	video_quality_mode?: number;
	bitrate?: number;
	user_limit?: number;
}

export interface TextChannel extends GuildChannel, TextBasedChannel {
	nsfw: boolean;
	rate_limit_per_user: number;
	topic?: string;
}
// @ts-ignore
export interface DMChannel extends Channel, TextBasedChannel {
	owner_id: string;
	recipient_ids: string[];
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
