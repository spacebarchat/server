export interface Guild {
	id: bigint;
	name: string;
	icon: string; // e.g. "28776e7ad42922582be25bb06cdc5b53"
	icon_hash: string;
	afk_channel_id: bigint;
	afk_timeout: number;
	application_id: bigint;
	banner: string; // id
	description: string;
	explicit_content_filter: number;
	features: string[];
	/* guild_hashes: // ? what is this
		channels: {hash: "uZsNP+TWAFY", omitted: false}
		metadata: {hash: "JCboqYj68bQ", omitted: false}
		roles: {hash: "1d7EJBRgVqg", omitted: false}
		version: 1
	*/
	joined_at: string; // user specific, Date Iso: "2021-01-23T19:01:23.126002+00:00"
	large: boolean;
	lazy: boolean; // ? what is this
	max_members: number; // e.g. default 100.000
	max_video_channel_users: number; // ? default: 25, is this max 25 streaming or watching
	member_count: number; // current member count
	mfa_level: number;
	owner_id: bigint;
	preferred_locale: string; // only partnered/verified guilds can choose this
	premium_subscription_count: number; // number of boosts
	premium_tier: number; // ? what is this
	public_updates_channel_id: bigint; //
	rules_channel_id: bigint;
	splash: string; // e.g. "32bec3d01f1dc90933cbb0bd75d333b0"
	system_channel_flags: number;
	system_channel_id: bigint;
	vanity_url_code: string;
	verification_level: number;
	threads: []; // ? not yet finished
}
