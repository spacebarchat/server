export interface GuildVoiceRegion {
	id: string;
	name: string;
	custom: boolean;
	deprecated: boolean;
	optimal: boolean;
}

export type GuildVoiceRegionsResponse = GuildVoiceRegion[];
