import { z } from "zod";

export const StreamDeleteSchema = z.object({
    stream_key: z.string(),
});

export type StreamDeleteSchema = z.infer<typeof StreamDeleteSchema>;
