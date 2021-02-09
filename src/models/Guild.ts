import { Channel } from "./Channel";
import { Emoji } from "./Emoji";
import { Member } from "./Member";
import { Role } from "./Role";

export interface Guild {
	afk_channel_id?: bigint;
	afk_timeout?: number;
	application_id?: bigint;
	approximate_member_count?: number;
	approximate_presence_count?: number;
	banner?: string;
	channels: Channel[];
	default_message_notifications?: number;
	description?: string;
	discovery_splash?: string;
	emojis: Emoji[];
	explicit_content_filter?: number;
	features: [];
	icon?: string;
	id: bigint;
	// joined_at?: number; \n // owner?: boolean;  // ! member specific should be removed
	large?: boolean;
	max_members?: number; // e.g. default 100.000
	max_presences?: number;
	max_video_channel_users?: number; // ? default: 25, is this max 25 streaming or watching
	member_count?: number;
	members?: Member[];
	mfa_level?: number;
	name: string;
	owner_id: bigint;
	permissions?: string;
	preferred_locale?: string; // only community guilds can choose this
	premium_subscription_count?: number;
	premium_tier?: number; // nitro boost level
	presences: []; // TODO: add model
	public_updates_channel_id?: bigint;
	region?: string;
	roles: Role[];
	rules_channel_id?: bigint;
	splash?: string;
	system_channel_flags?: number;
	system_channel_id?: bigint;
	unavailable?: boolean;
	vanity_url_code?: string;
	verification_level?: number;
	voice_states: []; // connected users
	welcome_screen: []; // welcome splash screen if a user joins guild
	widget_channel_id?: bigint;
	widget_enabled?: boolean;
}
