//TODO need more testing when community guild and voice stage channel are working
export interface VoiceStateUpdateSchema {
	guild_id?: string;
	channel_id?: string;
	self_mute: boolean;
	self_deaf: boolean;
	self_video?: boolean;
	preferred_region?: string;
	request_to_speak_timestamp?: Date;
	suppress?: boolean;
}

export const VoiceStateUpdateSchema = {
	$guild_id: String,
	$channel_id: String,
	self_mute: Boolean,
	self_deaf: Boolean,
	$self_video: Boolean,	//required in docs but bots don't always send it
	$preferred_region: String,
	$request_to_speak_timestamp: Date,
	$suppress: Boolean,
};