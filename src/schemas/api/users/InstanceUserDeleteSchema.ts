import { z } from "zod";

export const InstanceUserDeleteSchemaContent = z.object({
    reason: z.string().optional(),
    persistInstanceBan: z.boolean().optional(),
});

// Body is optional (can be undefined)
export const InstanceUserDeleteSchema = InstanceUserDeleteSchemaContent.optional();

export type InstanceUserDeleteSchemaContent = z.infer<typeof InstanceUserDeleteSchemaContent>;
export type InstanceUserDeleteSchema = z.infer<typeof InstanceUserDeleteSchema>;
