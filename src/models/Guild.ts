import { Channel } from "./Channel";
import { Emoji } from "./Emoji";
import { Member } from "./Member";
import { Role } from "./Role";

export interface Guild {
	id: bigint;
	name: string;
	icon: string;
	icon_hash: string;
	splash: string;
	discovery_splash: string;
	owner: boolean;
	owner_id: bigint;
	permissions: string;
	region: string;
	afk_channel_id: bigint;
	afk_timeout: number;
	widget_enabled: boolean;
	widget_channel_id: bigint;
	verification_level: number;
	default_message_notifications: number;
	explicit_content_filter: number;
	roles: Role[];
	emojis: Emoji[];
	features: [];
	mfa_level: number;
	application_id: bigint;
	system_channel_id: bigint;
	system_channel_flags: number;
	rules_channel_id: bigint;
	joined_at: number;
	large: boolean;
	unavailable: boolean;
	member_count: number;
	voice_states: []; // ! tf is this
	members: Member[];
	channels: Channel[];
	presences: []; // TODO: add model
	max_presences: number;
	max_members: number;
	vanity_url_code: string;
	description: string;
	banner: string;
	premium_tier: number;
	premium_subscription_count: number;
	preferred_locale: string;
	public_updates_channel_id: bigint;
	max_video_channel_users: number;
	approximate_member_count: number;
	approximate_presence_count: number;
	welcome_screen: []; // ! what is this
}
