import { z } from "zod";
import { ApplicationCommandHandlerType, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "./ApplicationCommandSchema";

const StringStringDictionary = z.record(z.string(), z.string());

const ApplicationCommandOptionChoice = z.object({
    name: z.string(),
    name_localizations: StringStringDictionary.optional(),
    value: z.union([z.string(), z.number()]),
});

export interface ApplicationCommandCreateSchemaOption {
    type: number;
    name: string;
    name_localizations?: Record<string, string>;
    description: string;
    description_localizations?: Record<string, string>;
    required?: boolean;
    choices?: {
        name: string;
        name_localizations?: Record<string, string>;
        value: string | number;
    }[];
    options?: ApplicationCommandCreateSchemaOption[];
    channel_types?: number[];
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
}

const ApplicationCommandCreateSchemaOption: z.ZodType<ApplicationCommandCreateSchemaOption> = z.lazy(() =>
    z.object({
        type: z.number(),
        name: z.string(),
        name_localizations: StringStringDictionary.optional(),
        description: z.string(),
        description_localizations: StringStringDictionary.optional(),
        required: z.boolean().optional(),
        choices: z.array(ApplicationCommandOptionChoice).optional(),
        options: z.array(ApplicationCommandCreateSchemaOption).optional(),
        channel_types: z.array(z.number()).optional(),
        min_value: z.number().optional(),
        max_value: z.number().optional(),
        min_length: z.number().optional(),
        max_length: z.number().optional(),
        autocomplete: z.boolean().optional(),
    }),
);

export const ApplicationCommandCreateSchema = z.object({
    type: z.enum(ApplicationCommandType).optional(),
    name: z.string(),
    name_localizations: StringStringDictionary.optional(),
    description: z.string().optional(),
    description_localizations: StringStringDictionary.optional(),
    options: z.array(ApplicationCommandCreateSchemaOption).optional(),
    default_member_permissions: z.string().optional(),
    dm_permission: z.boolean().optional(),
    nsfw: z.boolean().optional(),
    integration_types: z.array(z.enum(ApplicationIntegrationType)).optional(),
    contexts: z.array(z.enum(InteractionContextType)).optional(),
    handler: z.enum(ApplicationCommandHandlerType).optional(),
});

export type ApplicationCommandCreateSchema = z.infer<typeof ApplicationCommandCreateSchema>;

export const BulkApplicationCommandCreateSchema = z.array(ApplicationCommandCreateSchema);

export type BulkApplicationCommandCreateSchema = z.infer<typeof BulkApplicationCommandCreateSchema>;
