export interface GuildVanityUrl {
	code: string;
	uses: number;
}

export interface GuildVanityUrlNoInvite {
	code: null;
}

export type GuildVanityUrlResponse = GuildVanityUrl | GuildVanityUrl[] | GuildVanityUrlNoInvite;

export interface GuildVanityUrlCreateResponse {
	code: string;
}
