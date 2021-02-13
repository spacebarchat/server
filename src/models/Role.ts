import { Schema, model, Types, Document } from "mongoose";

export interface Role extends Document {
	id: bigint;
	color: number;
	hoist: boolean;
	managed: boolean;
	mentionable: boolean;
	name: string;
	permissions: bigint;
	position: number;
	tags?: {
		bot_id?: bigint;
	};
}

export const RoleSchema = new Schema({
	id: Types.Long,
	color: Number,
	hoist: Boolean,
	managed: Boolean,
	mentionable: Boolean,
	name: String,
	permissions: Types.Long,
	position: Number,
	tags: {
		bot_id: Types.Long,
	},
});

export const RoleModel = model<Role>("Role", RoleSchema, "roles");
