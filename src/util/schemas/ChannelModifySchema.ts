import { ChannelPermissionOverwriteType, ChannelType } from "..";

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
	flags?: number;
	default_thread_rate_limit_per_user?: number;
	auto_archive_duration?: 60 | 1440 | 4320 | 10080;
	archived?: boolean;
	locked?: boolean;
}
