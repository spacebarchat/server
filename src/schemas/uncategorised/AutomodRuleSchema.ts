/*
    Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
    Copyright (C) 2024 Spacebar and Spacebar Contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { z } from "zod";

const AutomodMentionSpamRuleSchema = z.object({
    mention_total_limit: z.number(),
    mention_raid_protection_enabled: z.boolean(),
});

const AutomodSuspectedSpamRuleSchema = z.object({});

const AutomodCommonlyFlaggedWordsRuleSchema = z.object({
    allow_list: z.array(z.string()),
    presets: z.array(z.number()),
});

const AutomodCustomWordsRuleSchema = z.object({
    allow_list: z.array(z.string()),
    keyword_filter: z.array(z.string()),
    regex_patterns: z.array(z.string()),
});

export const AutomodRuleSchema = z.object({
    creator_id: z.string(),
    enabled: z.boolean(),
    event_type: z.number(),
    exempt_channels: z.array(z.string()),
    exempt_roles: z.array(z.string()),
    guild_id: z.string(),
    name: z.string(),
    position: z.number(),
    trigger_type: z.number(),
    trigger_metadata: z.union([AutomodMentionSpamRuleSchema, AutomodSuspectedSpamRuleSchema, AutomodCommonlyFlaggedWordsRuleSchema, AutomodCustomWordsRuleSchema]),
});

export const AutomodRuleSchemaWithId = AutomodRuleSchema.extend({ id: z.string() });

export type AutomodRuleSchema = z.infer<typeof AutomodRuleSchema>;
export type AutomodRuleSchemaWithId = z.infer<typeof AutomodRuleSchemaWithId>;
