import { PublicMember } from "./Member";

export interface VoiceState {
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
