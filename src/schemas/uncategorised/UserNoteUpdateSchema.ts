import { z } from "zod";

export const UserNoteUpdateSchema = z.object({
    note: z.string(),
});

export type UserNoteUpdateSchema = z.infer<typeof UserNoteUpdateSchema>;
