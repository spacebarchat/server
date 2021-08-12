import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";

export interface Emoji extends Document {
	id: string;
	animated: boolean;
	available: boolean;
	guild_id: string;
	managed: boolean;
	name: string;
	require_colons: boolean;
	url: string;
	roles: string[]; // roles this emoji is whitelisted to (new discord feature?)
}

export const EmojiSchema = new Schema({
	id: { type: String, required: true },
	animated: Boolean,
	available: Boolean,
	guild_id: String,
	managed: Boolean,
	name: String,
	require_colons: Boolean,
	url: String,
	roles: [String],
});

// @ts-ignore
export const EmojiModel = db.model<Emoji>("Emoji", EmojiSchema, "emojis");
