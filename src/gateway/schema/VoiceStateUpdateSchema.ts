export const VoiceStateUpdateSchema = {
	$guild_id: String,
	$channel_id: String,
	self_mute: Boolean,
	self_deaf: Boolean,
	$self_video: Boolean,	//required in docs but bots don't always send it
	$preferred_region: String,
};

export interface VoiceStateUpdateSchema {
	guild_id?: string;
	channel_id?: string;
	self_mute: boolean;
	self_deaf: boolean;
	self_video?: boolean;
	preferred_region?: string;
}