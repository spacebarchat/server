import { z } from "zod";

export const StreamWatchSchema = z.object({
    stream_key: z.string(),
});

export type StreamWatchSchema = z.infer<typeof StreamWatchSchema>;
