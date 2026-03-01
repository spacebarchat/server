import { z } from "zod";
import { LazyRequestSchema } from "../gateway/LazyRequestSchema";

export const GuildSubscriptionSchema = LazyRequestSchema.omit({ guild_id: true });
export type GuildSubscriptionSchema = z.infer<typeof GuildSubscriptionSchema>;

export const GuildSubscriptionsBulkSchema = z.object({
    subscriptions: z.record(z.string(), GuildSubscriptionSchema),
});
export type GuildSubscriptionsBulkSchema = z.infer<typeof GuildSubscriptionsBulkSchema>;
