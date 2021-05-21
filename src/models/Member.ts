import { PublicUser, PublicUserProjection, User, UserModel } from "./User";
import { Schema, Types, Document } from "mongoose";
import db from "../util/Database";

export const PublicMemberProjection = {
	id: true,
	guild_id: true,
	nick: true,
	roles: true,
	joined_at: true,
	pending: true,
	deaf: true,
	mute: true,
	premium_since: true,
};

export interface Member {
	id: string;
	guild_id: string;
	nick?: string;
	roles: string[];
	joined_at: Date;
	premium_since?: number;
	deaf: boolean;
	mute: boolean;
	pending: boolean;
	settings: UserGuildSettings;
	read_state: Record<string, string | null>;
	// virtual
	user?: User;
}

export interface MemberDocument extends Member, Document {
	id: string;
}

export interface UserGuildSettings {
	channel_overrides: {
		channel_id: string;
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
	id: { type: String, required: true },
	guild_id: String,
	nick: String,
	roles: [String],
	joined_at: Date,
	premium_since: Number,
	deaf: Boolean,
	mute: Boolean,
	pending: Boolean,
	read_state: Object,
	settings: {
		channel_overrides: [
			{
				channel_id: String,
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
	autopopulate: {
		select: PublicUserProjection,
	},
});

// @ts-ignore
export const MemberModel = db.model<MemberDocument>("Member", MemberSchema, "members");

// @ts-ignore
export interface PublicMember extends Omit<Member, "settings" | "id"> {
	user: PublicUser;
}
