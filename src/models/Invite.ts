import { Schema, Document, Types } from "mongoose";
import db from "../util/Database";

export interface Invite extends Document {
	code: string;
	temporary: boolean;
	uses: number;
	max_uses: number;
	max_age: number;
	created_at: Date;
	guild_id: bigint;
	channel_id: bigint;
	inviter_id: bigint;

	//! What the fucking shit is this
	target_user_id?: bigint;
	target_user_type?: number;
	// !
}

export const InviteSchema = new Schema({
	code: String,
	temporary: Boolean,
	uses: Number,
	max_uses: Number,
	max_age: Number,
	created_at: Date,
	guild_id: Types.Long,
	channel_id: Types.Long,
	inviter_id: Types.Long,

	//! What the fucking shit is this
	target_user_id: Types.Long,
	target_user_type: Number,
	// !
});

// @ts-ignore
export const InviteModel = db.model<Invite>("Invite", InviteSchema, "invites");
