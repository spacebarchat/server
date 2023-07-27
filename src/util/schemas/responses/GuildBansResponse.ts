export interface GuildBansResponse {
	reason: string;
	user: {
		username: string;
		discriminator: string;
		id: string;
		avatar: string | null;
		public_flags: number;
	};
}
