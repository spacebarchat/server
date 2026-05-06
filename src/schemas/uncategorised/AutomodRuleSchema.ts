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

import { AutomodAction, AutomodKeywordPresetType, AutomodRuleEventType, AutomodRuleTriggerType } from "../api/guilds/Automod";
import { Snowflake } from "../Identifiers";

export interface AutomodMentionSpamRuleSchema {
    mention_total_limit: number;
    mention_raid_protection_enabled: boolean;
}

// export interface AutomodSuspectedSpamRuleSchema {}
export type AutomodSuspectedSpamRuleSchema = Record<string, never>; // hack to represent an empty object

export interface AutomodCommonlyFlaggedWordsRuleSchema {
    allow_list: string[];
    presets: AutomodKeywordPresetType[];
}

export interface AutomodCustomWordsRuleSchema {
    allow_list: string[];
    keyword_filter: string[];
    regex_patterns: string[];
}

export interface AutomodRuleSchema {
    name: string;
    event_type: AutomodRuleEventType;
    trigger_type: AutomodRuleTriggerType;
    actions: AutomodAction[];
    trigger_metadata?: AutomodMentionSpamRuleSchema | AutomodSuspectedSpamRuleSchema | AutomodCommonlyFlaggedWordsRuleSchema | AutomodCustomWordsRuleSchema | null;
    enabled?: boolean;
    exempt_channels?: Snowflake[];
    exempt_roles?: Snowflake[];
}

export interface AutomodRuleModifySchema {
    name?: string;
    event_type?: AutomodRuleEventType;
    actions?: AutomodAction[];
    trigger_metadata?: AutomodMentionSpamRuleSchema | AutomodSuspectedSpamRuleSchema | AutomodCommonlyFlaggedWordsRuleSchema | AutomodCustomWordsRuleSchema | null;
    enabled?: boolean;
    exempt_channels?: Snowflake[];
    exempt_roles?: Snowflake[];
}

export interface AutomodRuleResponse {
    id: Snowflake;
    creator_id: Snowflake;
    enabled: boolean;
    event_type: AutomodRuleEventType;
    exempt_channels: Snowflake[];
    exempt_roles: Snowflake[];
    guild_id: Snowflake;
    name: string;
    position: number;
    actions: AutomodAction[];
    trigger_type: AutomodRuleTriggerType;
    trigger_metadata: AutomodMentionSpamRuleSchema | AutomodSuspectedSpamRuleSchema | AutomodCommonlyFlaggedWordsRuleSchema | AutomodCustomWordsRuleSchema | null;
}

export type AutomodRulesResponse = AutomodRuleResponse[];
