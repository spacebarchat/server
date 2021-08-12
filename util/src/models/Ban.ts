import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";
import { PublicUserProjection, UserModel } from "./User";

export interface Ban extends Document {
	user_id: string;
	guild_id: string;
	executor_id: string;
	ip: string;
	reason?: string;
}

export const BanSchema = new Schema({
	user_id: { type: String, required: true },
	guild_id: { type: String, required: true },
	executor_id: { type: String, required: true },
	reason: String,
	ip: String, // ? Should we store this in here, or in the UserModel?
});

BanSchema.virtual("user", {
	ref: UserModel,
	localField: "user_id",
	foreignField: "id",
	justOne: true,
	autopopulate: { select: PublicUserProjection },
});

BanSchema.set("removeResponse", ["user_id"]);

// @ts-ignore
export const BanModel = db.model<Ban>("Ban", BanSchema, "bans");
