export interface LazyRequestSchema {
	guild_id: string;
	channels?: Record<string, [number, number][]>;
	activities?: boolean;
	threads?: boolean;
	typing?: true;
	members?: any[];
	thread_member_lists?: any[];
}

export const LazyRequestSchema = {
	guild_id: String,
	$activities: Boolean,
	$channels: Object,
	$typing: Boolean,
	$threads: Boolean,
	$members: [] as any[],
	$thread_member_lists: [] as any[],
};
