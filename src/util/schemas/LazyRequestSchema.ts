export interface LazyRequest {
	guild_id: string | number;
	channels?: Record<string, [number, number][]>;
	activities?: boolean;
	threads?: boolean;
	typing?: true;
	members?: any[];
	thread_member_lists?: any[];
}

export const LazyRequest = {
	guild_id: Number,
	$activities: Boolean,
	$channels: Object,
	$typing: Boolean,
	$threads: Boolean,
	$members: [] as any[],
	$thread_member_lists: [] as any[]
};
