import {
	Schema,
	model,
	Types,
	Document
} from "mongoose";
import db from "../util/Database";
import {
	PublicUser,
	User,
	UserModel,
	PublicUserProjection
} from "./User";
import {
	Guild, GuildModel
} from "./Guild";

export interface Template extends Document {
	code: string;
	name: string;
	description ? : string;
	usage_count ? : number;
	creator_id: string;
	creator: User;
	created_at: Date;
	updated_at: Date;
	source_guild_id: String;
	serialized_source_guild: Guild;
}

export const TemplateSchema = new Schema({
	code: String,
	name: String,
	description: String,
	usage_count: Number,
	creator_id: String,
	created_at: Date,
	updated_at: Date,
	source_guild_id: String,
});

TemplateSchema.virtual("creator", {
	ref: UserModel,
	localField: "creator_id",
	foreignField: "id",
	justOne: false,
	autopopulate: {
		select: PublicUserProjection
	},
});

TemplateSchema.virtual("serialized_source_guild", {
	ref: GuildModel,
	localField: "source_guild_id",
	foreignField: "id",
	justOne: false,
	autopopulate: true,
});

// @ts-ignore
export const TemplateModel = db.model < Template > ("Template", TemplateSchema, "templates");