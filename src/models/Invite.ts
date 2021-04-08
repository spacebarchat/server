import { Schema, Document, Types } from "mongoose";
import db from "../util/Database";

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

// @ts-ignore
export const InviteModel = db.model<Invite>("Invite", InviteSchema, "invites");
