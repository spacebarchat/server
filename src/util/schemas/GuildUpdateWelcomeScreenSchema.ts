
export interface GuildUpdateWelcomeScreenSchema {
	welcome_channels?: {
		channel_id: string;
		description: string;
		emoji_id?: string;
		emoji_name: string;
	}[];
	enabled?: boolean;
	description?: string;
}
