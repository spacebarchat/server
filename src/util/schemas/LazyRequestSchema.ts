export interface LazyRequestSchema {
	guild_id: string;
	channels?: Record<string, [number, number][]>;
	activities?: boolean;
	threads?: boolean;
	typing?: true;
	members?: unknown[];
	thread_member_lists?: unknown[];
}

export const LazyRequestSchema = {
	guild_id: String,
	$activities: Boolean,
	$channels: Object,
	$typing: Boolean,
	$threads: Boolean,
	$members: [] as unknown[],
	$thread_member_lists: [] as unknown[],
};
