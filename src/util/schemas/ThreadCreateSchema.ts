import { ChannelType } from "../entities";

export interface ThreadCreateSchema {
	auto_archive_duration?: 60 | 1440 | 4320 | 10080;
	location: string;
	name: string;
	type: ChannelType.GUILD_NEWS_THREAD | ChannelType.GUILD_PRIVATE_THREAD | ChannelType.GUILD_PUBLIC_THREAD;
	rate_limit_per_user?: number | null;
}
