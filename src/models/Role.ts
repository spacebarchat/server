import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";
import toBigInt from "../util/toBigInt";

export interface Role {
	id: string;
	guild_id: string;
	color: number;
	hoist: boolean;
	managed: boolean;
	mentionable: boolean;
	name: string;
	permissions: bigint;
	position: number;
	tags?: {
		bot_id?: string;
	};
}

export interface RoleDocument extends Document, Role {
	id: string;
}

export const RoleSchema = new Schema({
	id: String,
	guild_id: String,
	color: Number,
	hoist: Boolean,
	managed: Boolean,
	mentionable: Boolean,
	name: String,
	permissions: { type: String, get: toBigInt },
	position: Number,
	tags: {
		bot_id: String,
	},
});

RoleSchema.set("removeResponse", ["guild_id"]);

// @ts-ignore
export const RoleModel = db.model<RoleDocument>("Role", RoleSchema, "roles");
