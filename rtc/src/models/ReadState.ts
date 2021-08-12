import { PublicMember } from "./Member";
import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";

export interface ReadState extends Document {
	message_id: string;
	channel_id: string;
	user_id: string;
	last_message_id?: string;
	last_pin_timestamp?: Date;
	mention_count: number;
	manual: boolean;
}

export const ReadStateSchema = new Schema({
	message_id: String,
	channel_id: String,
	user_id: String,
	last_message_id: String,
	last_pin_timestamp: Date,
	mention_count: Number,
	manual: Boolean,
});

// @ts-ignore
export const ReadStateModel = db.model<ReadState>("ReadState", ReadStateSchema, "readstates");
