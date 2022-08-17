export const VoiceStateUpdateSchema = {
	$guild_id: Number, // TODO: mobile client sends a number here, does this still work on desktop/web?
	$channel_id: Number, // TODO: mobile client sends a number here, does this still work on desktop/web?
	self_mute: Boolean,
	self_deaf: Boolean,
	self_video: Boolean,
};

//TODO need more testing when community guild and voice stage channel are working
export interface VoiceStateUpdateSchema {
	channel_id: string | number; 
	guild_id?: string | number;
	suppress?: boolean;
	request_to_speak_timestamp?: Date;
	self_mute?: boolean;
	self_deaf?: boolean;
	self_video?: boolean;
}