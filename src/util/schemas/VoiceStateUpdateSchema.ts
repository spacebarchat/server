export const VoiceStateUpdateSchema = {
	$guild_id: String,
	$channel_id: String,
	self_mute: Boolean,
	self_deaf: Boolean,
	self_video: Boolean,
};

//TODO need more testing when community guild and voice stage channel are working
export interface VoiceStateUpdateSchema {
	channel_id: string;
	guild_id?: string;
	suppress?: boolean;
	request_to_speak_timestamp?: Date;
	self_mute?: boolean;
	self_deaf?: boolean;
	self_video?: boolean;
}