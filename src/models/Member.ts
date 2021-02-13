import { PublicUser } from "./User";
import { Schema, model, Types, Document } from "mongoose";

export interface Member extends Document {
	id: bigint;
	guild_id: bigint;
	nick?: string;
	roles: bigint[];
	joined_at: number;
	premium_since?: number;
	deaf: boolean;
	mute: boolean;
	pending: boolean;
	permissions: bigint;
	settings: UserGuildSettings;
}

export interface UserGuildSettings {
	channel_overrides: {
		channel_id: bigint;
		message_notifications: number;
		mute_config: MuteConfig;
		muted: boolean;
	}[];
	message_notifications: number;
	mobile_push: boolean;
	mute_config: MuteConfig;
	muted: boolean;
	suppress_everyone: boolean;
	suppress_roles: boolean;
	version: number;
}

export interface MuteConfig {
	end_time: number;
	selected_time_window: number;
}

const MuteConfig = {
	end_time: Number,
	selected_time_window: Number,
};

export const MemberSchema = new Schema({
	id: Types.Long,
	guild_id: Types.Long,
	nick: String,
	roles: [Types.Long],
	joined_at: Number,
	premium_since: Number,
	deaf: Boolean,
	mute: Boolean,
	pending: Boolean,
	permissions: Types.Long,
	settings: {
		channel_overrides: [
			{
				channel_id: Types.Long,
				message_notifications: Number,
				mute_config: MuteConfig,
				muted: Boolean,
			},
		],
		message_notifications: Number,
		mobile_push: Boolean,
		mute_config: MuteConfig,
		muted: Boolean,
		suppress_everyone: Boolean,
		suppress_roles: Boolean,
		version: Number,
	},
});

export const MemberModel = model<Member>("Member", MemberSchema, "members");

export interface PublicMember extends Omit<Member, "settings" | "id"> {
	user: PublicUser;
}
