/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { Snowflake } from "../../Identifiers";

interface BaseAutomodRuleSchema {
    enabled: boolean;
    event_type: AutomodRuleEventType;
    exempt_channels?: Snowflake[];
    exempt_roles?: Snowflake[];
    name: string;
    actions: AutomodAction[];
}

type WithTrigger<T, M> = BaseAutomodRuleSchema & {
    trigger_type: T;
} & M extends never
    ? { trigger_metadata?: never }
    : { trigger_metadata: M };

type KeywordRule = WithTrigger<AutomodRuleTriggerType.KEYWORD, AutomodCustomWordsRuleMetadata>;
type HarmfulLinkRule = WithTrigger<AutomodRuleTriggerType.HARMFUL_LINK, never>;
type SpamRule = WithTrigger<AutomodRuleTriggerType.SPAM, never>;
type KeywordPresetRule = WithTrigger<AutomodRuleTriggerType.KEYWORD_PRESET, AutomodKeywordPresetRuleMetadata>;
type MentionSpamRule = WithTrigger<AutomodRuleTriggerType.MENTION_SPAM, AutomodMentionSpamRuleMetadata>;
type UserProfileRule = WithTrigger<AutomodRuleTriggerType.USER_PROFILE, AutomodUserProfileRuleMetadata>;
type GuildPolicyRule = WithTrigger<AutomodRuleTriggerType.GUILD_POLICY, never>;

export type AutomodRuleSchema = KeywordRule | HarmfulLinkRule | SpamRule | KeywordPresetRule | MentionSpamRule | UserProfileRule | GuildPolicyRule;

export type AutomodRuleSchemaWithId = AutomodRuleSchema & {
    id: Snowflake;
    creator_id: Snowflake;
    guild_id: Snowflake;
    position: number;
    exempt_roles?: Snowflake[];
};

export type AutomodRuleTriggerMetadata = AutomodCustomWordsRuleMetadata | AutomodKeywordPresetRuleMetadata | AutomodMentionSpamRuleMetadata | AutomodUserProfileRuleMetadata;

export interface AutomodMentionSpamRuleMetadata {
    mention_total_limit: number;
    mention_raid_protection_enabled: boolean;
}

export interface AutomodKeywordPresetRuleMetadata {
    allow_list: string[];
    presets: AutomodKeywordPresetType[];
}

export interface AutomodCustomWordsRuleMetadata {
    allow_list: string[];
    keyword_filter: string[];
    regex_patterns: string[];
}

// the same as custom words, but separate to allow divergence
export interface AutomodUserProfileRuleMetadata {
    allow_list: string[];
    keyword_filter: string[];
    regex_patterns: string[];
}

export enum AutomodRuleEventType {
    MESSAGE_SEND = 1,
    GUILD_MEMBER_EVENT = 2,
}

export enum AutomodRuleTriggerType {
    KEYWORD = 1,
    HARMFUL_LINK = 2,
    SPAM = 3,
    KEYWORD_PRESET = 4,
    MENTION_SPAM = 5,
    USER_PROFILE = 6,
    GUILD_POLICY = 7,
}

export enum AutomodKeywordPresetType {
    PROFANITY = 1,
    SEXUAL_CONTENT = 2,
    SLURS = 3,
}

export enum AutomodRuleActionType {
    BLOCK_MESSAGE = 1,
    SEND_ALERT_MESSAGE = 2,
    TIMEOUT_USER = 3,
    QUARANTINE_USER = 4,
}

export type AutomodAction =
    | {
          type: AutomodRuleActionType.BLOCK_MESSAGE;
          metadata: { custom_message?: string };
      }
    | {
          type: AutomodRuleActionType.SEND_ALERT_MESSAGE;
          metadata: { channel_id: Snowflake };
      }
    | {
          type: AutomodRuleActionType.TIMEOUT_USER;
          metadata: { duration_seconds: number };
      }
    | {
          type: AutomodRuleActionType.QUARANTINE_USER;
          metadata: { duration_seconds: number };
      };

// TODO
// eslint-disable-next-line
export interface AutomodRuleActionMetadata {}
