export const VoiceStateUpdateSchema = {
	guild_id: String,
	channel_id: String,
	self_mute: Boolean,
	self_deaf: Boolean,
};

export interface VoiceStateUpdateSchema {
	guild_id: string;
	channel_id: string;
	self_mute: boolean;
	self_deaf: boolean;
}
