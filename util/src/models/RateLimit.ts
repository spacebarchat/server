import { Schema, Document, Types } from "mongoose";
import db from "../util/Database";

export interface Bucket {
	id: "global" | "error" | string; // channel_239842397 | guild_238927349823 | webhook_238923423498
	user_id: string;
	hits: number;
	blocked: boolean;
	expires_at: Date;
}

export interface BucketDocument extends Bucket, Document {
	id: string;
}

export const BucketSchema = new Schema({
	id: { type: String, required: true },
	user_id: { type: String, required: true }, // bot, user, oauth_application, webhook
	hits: { type: Number, required: true }, // Number of times the user hit this bucket
	blocked: { type: Boolean, required: true },
	expires_at: { type: Date, required: true },
});

// @ts-ignore
export const BucketModel = db.model<BucketDocument>("Bucket", BucketSchema, "ratelimits");
