import { ChannelPermissionOverwriteType, ChannelType } from "@fosscord/util";

export interface ChannelModifySchema {
	/**
	 * @maxLength 100
	 */
	name?: string;
	type?: ChannelType;
	topic?: string;
	icon?: string | null;
	bitrate?: number;
	user_limit?: number;
	rate_limit_per_user?: number;
	position?: number;
	permission_overwrites?: {
		id: string;
		type: ChannelPermissionOverwriteType;
		allow: string;
		deny: string;
	}[];
	parent_id?: string;
	id?: string; // is not used (only for guild create)
	nsfw?: boolean;
	rtc_region?: string;
	default_auto_archive_duration?: number;
	default_reaction_emoji?: string | null;
	flags?: number;
	default_thread_rate_limit_per_user?: number;
	video_quality_mode?: number;
}