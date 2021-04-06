import { ActivitySchema } from "./Activity";

export const IdentifySchema = {
	token: String,
	$intents: BigInt, // discord uses a Integer for bitfields we use bigints tho. | instanceOf will automatically convert the Number to a BigInt
	$properties: {
		// bruh discord really uses $ in the property key for bots, so we need to double prefix it, because instanceOf treats $ (prefix) as a optional key
		$os: String,
		$browser: String,
		$device: String,
		$$os: String,
		$$browser: String,
		$$device: String,
		$browser_user_agent: String,
		$browser_version: String,
		$os_version: String,
		$referrer: String,
		$referring_domain: String,
		$referrer_current: String,
		$referring_domain_current: String,
		$release_channel: String,
		$client_build_number: Number,
		$client_event_source: String,
	},
	$presence: ActivitySchema,
	$compress: Boolean,
	$large_threshold: Number,
	$shard: [Number],
	$guild_subscriptions: Boolean,
	$capabilities: Number,
	$client_state: {
		$guild_hashes: Object,
		$highest_last_message_id: BigInt,
		$read_state_version: Number,
		$user_guild_settings_version: Number,
	},
};

export interface IdentifySchema {
	token: string;
	properties: {
		// bruh discord really uses $ in the property key, so we need to double prefix it, because instanceOf treats $ (prefix) as a optional key
		os?: string;
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
	};
	intents?: bigint; // discord uses a Integer for bitfields we use bigints tho. | instanceOf will automatically convert the Number to a BigInt
	presence?: ActivitySchema;
	compress?: boolean;
	large_threshold?: number;
	shard?: [number];
	guild_subscriptions?: boolean;
	capabilities?: number;
	client_state?: {
		guild_hashes?: any;
		highest_last_message_id?: bigint;
		read_state_version?: number;
		user_guild_settings_version?: number;
	};
}
