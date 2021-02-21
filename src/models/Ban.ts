import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";

export interface Ban extends Document {
	user_id: bigint;
	guild_id: bigint;
	executor_id: bigint;
	ip: string;
	reason?: string;
}

export const BanSchema = new Schema({
	user_id: { type: Types.Long, required: true },
	guild_id: { type: Types.Long, required: true },
	executor_id: { type: BigInt, required: true },
	reason: String,
	ip: String, // ? Should we store this in here, or in the UserModel?
});

// @ts-ignore
export const BanModel = db.model<Ban>("Ban", BanSchema, "bans");
