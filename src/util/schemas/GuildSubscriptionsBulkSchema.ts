import { LazyRequestSchema } from "./LazyRequestSchema";

export interface GuildSubscriptionsBulkSchema {
	subscriptions: { [key: string]: GuildSubscriptionSchema };
}

export type GuildSubscriptionSchema = Omit<LazyRequestSchema, "guild_id">;

export const GuildSubscriptionsBulkSchema = {
	$subscriptions: Object,
};
