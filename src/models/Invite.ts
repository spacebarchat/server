import { Schema, Document, Types } from "mongoose";
import db from "../util/Database";
import { ChannelModel } from "./Channel";
import { UserModel } from "./User";
import { GuildModel } from "./Guild";

export interface Invite extends Document {
	code: string;
	temporary: boolean;
	uses: number;
	max_uses: number;
	max_age: number;
	created_at: Date;
	guild_id: string;
	channel_id: string;
	inviter_id: string;

	// ? What the fucking shit is this
	target_user_id?: string;
	target_user_type?: number;
}

export const InviteSchema = new Schema({
	code: String,
	temporary: Boolean,
	uses: Number,
	max_uses: Number,
	max_age: Number,
	created_at: Date,
	guild_id: String,
	channel_id: String,
	inviter_id: String,

	// ? What the fucking shit is this
	target_user_id: String,
	target_user_type: Number,
});

InviteSchema.virtual("channel", {
	ref: ChannelModel,
	localField: "channel_id",
	foreignField: "id",
	justOne: true,
	autopopulate: {
		select: {
			id: true,
			name: true,
			type: true,
		},
	},
});

InviteSchema.virtual("inviter", {
	ref: UserModel,
	localField: "inviter_id",
	foreignField: "id",
	justOne: true,
	autopopulate: {
		select: {
			id: true,
			username: true,
			avatar: true,
			discriminater: true,
			public_flags: true,
		},
	},
});

InviteSchema.virtual("guild", {
	ref: GuildModel,
	localField: "guild_id",
	foreignField: "id",
	justOne: true,
	autopopulate: {
		select: {
			id: true,
			name: true,
			splash: true,
			banner: true,
			description: true,
			icon: true,
			features: true,
			verification_level: true,
			vanity_url_code: true,
			welcome_screen: true,
			nsfw: true,

			// TODO: hide the following entries:
			// channels: false,
			// roles: false,
			// emojis: false,
		},
	},
});

// @ts-ignore
export const InviteModel = db.model<Invite>("Invite", InviteSchema, "invites");
