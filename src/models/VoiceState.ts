import { PublicMember } from "./Member";
import { Schema, model, Types, Document } from "mongoose";

export interface VoiceState extends Document {
	guild_id?: bigint;
	channel_id: bigint;
	user_id: bigint;
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
	guild_id: Types.Long,
	channel_id: Types.Long,
	user_id: Types.Long,
	session_id: String,
	deaf: Boolean,
	mute: Boolean,
	self_deaf: Boolean,
	self_mute: Boolean,
	self_stream: Boolean,
	self_video: Boolean,
	suppress: Boolean, // whether this user is muted by the current user
});

export const VoiceStateModel = model<VoiceState>("VoiceState", VoiceSateSchema, "voicestates");
