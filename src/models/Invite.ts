import { Schema, model, Types, Document } from "mongoose";

export interface Invite extends Document {
	code: string;
	temporary: boolean;
	uses: number;
	max_uses: number;
	max_age: number;
	created_at: number;
	guild: {
		id: bigint;
		name: string;
		splash: string;
		description: string;
		icon: string;
		features: Object;
		verification_level: number;
	};
	channel: {
		id: bigint;
		name: string;
		type: number;
	};
	inviter: {
		id: bigint;
		username: string;
		avatar: string;
		discriminator: number;
	};
	target_user: {
		id: bigint;
		username: string;
		avatar: string;
		discriminator: number;
	};
	target_user_type: number;
}

export const InviteSchema = new Schema({
	code: String,
	temporary: Boolean,
	uses: Number,
	max_uses: Number,
	max_age: Number,
	created_at: Number,
	guild: {
		id: Types.Long,
		name: String,
		splash: String,
		description: String,
		icon: String,
		features: Object,
		verification_level: Number,
	},
	channel: {
		id: Types.Long,
		name: String,
		type: Number,
	},

	inviter: {
		id: Types.Long,
		username: String,
		avatar: String,
		discriminator: Number,
	},
	target_user: {
		id: Types.Long,
		username: String,
		avatar: String,
		discriminator: Number,
	},
	target_user_type: Number,
});

export const InviteModel = model<Invite>("Invite", InviteSchema, "invites");
