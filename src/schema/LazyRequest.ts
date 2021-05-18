export interface LazyRequest {
	activities: boolean;
	channels: Record<string, [number, number]>;
	guild_id: string;
	threads: boolean;
	typing: true;
}

export const LazyRequest = {
	activities: Boolean,
	channels: Object,
	guild_id: String,
	threads: Boolean,
	typing: Boolean,
};
