import { PublicMember } from "./Member";
import { Schema, model, Types, Document } from "mongoose";
import db from "../util/Database";

export interface VoiceState extends Document {
	guild_id?: string;
	channel_id: string;
	user_id: string;
	session_id: string;
	deaf: boolean;
	mute: boolean;
	self_deaf: boolean;
	self_mute: boolean;
	self_stream?: boolean;
	self_video: boolean;
	suppress: boolean; // whether this user is muted by the current user
}

export const VoiceSateSchema = new Schema({
	guild_id: String,
	channel_id: String,
	user_id: String,
	session_id: String,
	deaf: Boolean,
	mute: Boolean,
	self_deaf: Boolean,
	self_mute: Boolean,
	self_stream: Boolean,
	self_video: Boolean,
	suppress: Boolean, // whether this user is muted by the current user
});

// @ts-ignore
export const VoiceStateModel = db.model<VoiceState>("VoiceState", VoiceSateSchema, "voicestates");
