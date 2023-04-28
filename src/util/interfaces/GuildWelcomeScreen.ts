export interface GuildWelcomeScreen {
	enabled: boolean;
	description: string;
	welcome_channels: {
		description: string;
		emoji_id?: string;
		emoji_name?: string;
		channel_id: string;
	}[];
}
