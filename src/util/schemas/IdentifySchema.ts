import { ActivitySchema } from "@fosscord/util";

export const IdentifySchema = {
	token: String,
	$intents: BigInt, // discord uses a Integer for bitfields we use bigints tho. | instanceOf will automatically convert the Number to a BigInt
	$properties: Object,
	// {
	// 	// discord uses $ in the property key for bots, so we need to double prefix it, because instanceOf treats $ (prefix) as a optional key
	// 	$os: String,
	// 	$os_arch: String,
	// 	$browser: String,
	// 	$device: String,
	// 	$$os: String,
	// 	$$browser: String,
	// 	$$device: String,
	// 	$browser_user_agent: String,
	// 	$browser_version: String,
	// 	$os_version: String,
	// 	$referrer: String,
	// 	$$referrer: String,
	// 	$referring_domain: String,
	// 	$$referring_domain: String,
	// 	$referrer_current: String,
	// 	$referring_domain_current: String,
	// 	$release_channel: String,
	// 	$client_build_number: Number,
	// 	$client_event_source: String,
	// 	$client_version: String,
	// 	$system_locale: String,
	// 	$window_manager: String,
	// 	$distro: String,
	// },
	$presence: ActivitySchema,
	$compress: Boolean,
	$large_threshold: Number,
	$shard: [BigInt, BigInt],
	$guild_subscriptions: Boolean,
	$capabilities: Number,
	$client_state: {
		$guild_hashes: Object,
		$highest_last_message_id: String || Number,
		$read_state_version: Number,
		$user_guild_settings_version: Number,
		$user_settings_version: undefined,
		$useruser_guild_settings_version: undefined,
		$private_channels_version: Number,
	},
	$clientState: {
		$guildHashes: Object,
		$highestLastMessageId: String || Number,
		$readStateVersion: Number,
		$useruserGuildSettingsVersion: undefined,
		$userGuildSettingsVersion: undefined,
	},
	$v: Number,
	$version: Number,
};

export interface IdentifySchema {
	token: string;
	properties: {
		// bruh discord really uses $ in the property key, so we need to double prefix it, because instanceOf treats $ (prefix) as a optional key
		os?: string;
		os_atch?: string;
		browser?: string;
		device?: string;
		$os?: string;
		$browser?: string;
		$device?: string;
		browser_user_agent?: string;
		browser_version?: string;
		os_version?: string;
		referrer?: string;
		referring_domain?: string;
		referrer_current?: string;
		referring_domain_current?: string;
		release_channel?: "stable" | "dev" | "ptb" | "canary";
		client_build_number?: number;
		client_event_source?: any;
		client_version?: string;
		system_locale?: string;
	};
	intents?: bigint; // discord uses a Integer for bitfields we use bigints tho. | instanceOf will automatically convert the Number to a BigInt
	presence?: ActivitySchema;
	compress?: boolean;
	large_threshold?: number;
	largeThreshold?: number;
	shard?: [bigint, bigint];
	guild_subscriptions?: boolean;
	capabilities?: number;
	client_state?: {
		guild_hashes?: any;
		highest_last_message_id?: string | number;
		read_state_version?: number;
		user_guild_settings_version?: number;
		user_settings_version?: number;
		useruser_guild_settings_version?: number;
		private_channels_version?: number;
	};
	clientState?: {
		guildHashes?: any;
		highestLastMessageId?: string | number;
		readStateVersion?: number;
		userGuildSettingsVersion?: number;
		useruserGuildSettingsVersion?: number;
	};
	v?: number;
}
