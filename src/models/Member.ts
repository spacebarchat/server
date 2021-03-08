import { PublicUser, User, UserModel } from "./User";
import { Schema, Types, Document } from "mongoose";
import db from "../util/Database";

export interface Member {
	id: bigint;
	guild_id: bigint;
	nick?: string;
	roles: bigint[];
	joined_at: Date;
	premium_since?: number;
	deaf: boolean;
	mute: boolean;
	pending: boolean;
	settings: UserGuildSettings;
	user?: User;
}

export interface MemberDocument extends Member, Document {
	id: bigint;
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
	id: { type: Types.Long, required: true },
	guild_id: Types.Long,
	nick: String,
	roles: [Types.Long],
	joined_at: Date,
	premium_since: Number,
	deaf: Boolean,
	mute: Boolean,
	pending: Boolean,
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

MemberSchema.virtual("user", {
	ref: UserModel,
	localField: "id",
	foreignField: "id",
	justOne: true,
});

// @ts-ignore
export const MemberModel = db.model<MemberDocument>("Member", MemberSchema, "members");

// @ts-ignore
export interface PublicMember extends Omit<Member, "settings" | "id"> {
	user: PublicUser;
}
