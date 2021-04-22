import { Schema, Document, Types } from "mongoose";
import { transpileModule } from "typescript";
import db from "../util/Database";
import { ChannelModel } from "./Channel";
import { GuildModel } from "./Guild";

export interface Webhook {}

export enum WebhookType {
	Incoming = 1,
	ChannelFollower = 2,
}

export interface WebhookDocument extends Document, Webhook {
	id: String;
	type: number;
	guild_id?: string;
	channel_id: string;
	name?: string;
	avatar?: string;
	token?: string;
	application_id?: string;
	user_id?: string;
	source_guild_id: string;
}

export const WebhookSchema = new Schema({
	id: { type: String, required: true },
	type: { type: Number, required: true },
	guild_id: String,
	channel_id: String,
	name: String,
	avatar: String,
	token: String,
	application_id: String,
	user_id: String,
	source_guild_id: String,
	source_channel_id: String,
});

WebhookSchema.virtual("source_guild", {
	ref: GuildModel,
	localField: "id",
	foreignField: "source_guild_id",
	justOne: true,
	autopopulate: {
		select: {
			icon: true,
			id: true,
			name: true,
		},
	},
});

WebhookSchema.virtual("source_channel", {
	ref: ChannelModel,
	localField: "id",
	foreignField: "source_channel_id",
	justOne: true,
	autopopulate: {
		select: {
			id: true,
			name: true,
		},
	},
});

WebhookSchema.virtual("source_channel", {
	ref: ChannelModel,
	localField: "id",
	foreignField: "source_channel_id",
	justOne: true,
	autopopulate: {
		select: {
			id: true,
			name: true,
		},
	},
});

WebhookSchema.set("removeResponse", ["source_channel_id", "source_guild_id"]);

export const WebhookModel = db.model<WebhookDocument>("Webhook", WebhookSchema, "webhooks");
