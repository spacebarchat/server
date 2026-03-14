export interface GuildSubscriptionsBulkSchema {
    subscriptions: { [key: string]: GuildSubscriptionSchema };
}

export type GuildSubscriptionSchema = Omit<LazyRequestSchema, "guild_id">;

export const GuildSubscriptionsBulkSchema = {
    $subscriptions: Object,
};

export interface LazyRequestSchema {
    guild_id: string;
    channels?: {
        /**
         * @items.type integer
         * @minItems 2
         * @maxItems 2
         */
        [key: string]: number[][]; // puyo: changed from [number, number] because it breaks openapi
    };
    activities?: boolean;
    threads?: boolean;
    typing?: true;
    members?: string[];
    member_updates?: boolean;
    thread_member_lists?: unknown[];
}

export const LazyRequestSchema = {
    guild_id: String,
    $activities: Boolean,
    $channels: Object,
    $typing: Boolean,
    $threads: Boolean,
    $members: [] as string[],
    $member_updates: Boolean,
    $thread_member_lists: [] as unknown[],
};
