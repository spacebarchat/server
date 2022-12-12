import { GuildCreateSchema } from ".";

export interface GuildUpdateSchema extends Omit<GuildCreateSchema, "channels" | "name"> {
	name?: string;
	banner?: string | null;
	splash?: string | null;
	description?: string;
	features?: string[];
	verification_level?: number;
	default_message_notifications?: number;
	system_channel_flags?: number;
	explicit_content_filter?: number;
	public_updates_channel_id?: string;
	afk_timeout?: number;
	afk_channel_id?: string;
	preferred_locale?: string;
	premium_progress_bar_enabled?: boolean;
}
