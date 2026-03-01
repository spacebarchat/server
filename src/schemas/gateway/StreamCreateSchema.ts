import { z } from "zod";

export const StreamCreateSchema = z.object({
    type: z.enum(["guild", "call"]),
    channel_id: z.string(),
    guild_id: z.string().optional(),
    preferred_region: z.string().optional(),
});

export type StreamCreateSchema = z.infer<typeof StreamCreateSchema>;
