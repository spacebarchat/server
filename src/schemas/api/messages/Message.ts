/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { Attachment, Sticker } from "@spacebar/util";
import { Embed, MessageActivity, MessageComponent, PartialUser, Poll, PublicChannel, Snowflake } from "@spacebar/schemas";
import { PublicAttachment } from "./Attachments";

export enum MessageType {
    DEFAULT = 0,
    RECIPIENT_ADD = 1,
    RECIPIENT_REMOVE = 2,
    CALL = 3,
    CHANNEL_NAME_CHANGE = 4,
    CHANNEL_ICON_CHANGE = 5,
    CHANNEL_PINNED_MESSAGE = 6,
    GUILD_MEMBER_JOIN = 7,
    USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
    CHANNEL_FOLLOW_ADD = 12,
    ACTION = 13, // /me messages
    GUILD_DISCOVERY_DISQUALIFIED = 14,
    GUILD_DISCOVERY_REQUALIFIED = 15,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING = 16,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING = 17,
    THREAD_CREATED = 18,
    REPLY = 19,
    APPLICATION_COMMAND = 20, // application command or self command invocation
    THREAD_STARTER_MESSAGE = 21,
    GUILD_INVITE_REMINDER = 22,
    CONTEXT_MENU_COMMAND = 23,
    AUTO_MODERATION_ACTION = 24,
    ROLE_SUBSCRIPTION_PURCHASE = 25,
    INTERACTION_PREMIUM_UPSELL = 26,
    STAGE_START = 27,
    STAGE_END = 28,
    STAGE_SPEAKER = 29,
    STAGE_RAISE_HAND = 30,
    STAGE_TOPIC = 31,
    GUILD_APPLICATION_PREMIUM_SUBSCRIPTION = 32,
    PRIVATE_CHANNEL_INTEGRATION_ADDED = 33, // @deprecated
    PRIVATE_CHANNEL_INTEGRATION_REMOVED = 34, // @deprecated
    PREMIUM_REFERRAL = 35,
    GUILD_INCIDENT_ALERT_MODE_ENABLED = 36,
    GUILD_INCIDENT_ALERT_MODE_DISABLED = 37,
    GUILD_INCIDENT_REPORT_RAID = 38,
    GUILD_INCIDENT_REPORT_FALSE_ALARM = 39,
    GUILD_DEADCHAT_REVIVE_PROMPT = 40,
    CUSTOM_GIFT = 41,
    GUILD_GAMING_STATS_PROMPT = 42,
    POLL = 43, // @deprecated
    PURCHASE_NOTIFICATION = 44,
    VOICE_HANGOUT_INVITE = 45, // @deprecated
    POLL_RESULT = 46,
    CHANGELOG = 47,
    NITRO_NOTIFICATION = 48,
    CHANNEL_LINKED_TO_LOBBY = 49,
    GIFTING_PROMPT = 50,
    IN_GAME_MESSAGE_NUX = 51,
    GUILD_JOIN_REQUEST_ACCEPT_NOTIFICATION = 52,
    GUILD_JOIN_REQUEST_REJECT_NOTIFICATION = 53,
    GUILD_JOIN_REQUEST_WITHDRAWN_NOTIFICATION = 54,
    HD_STREAMING_UPGRADED = 55,
    CHAT_WALLPAPER_SET = 56, // @deprecated
    CHAT_WALLPAPER_REMOVE = 57, // @deprecated
    REPORT_TO_MOD_DELETED_MESSAGE = 58,
    REPORT_TO_MOD_TIMEOUT_USER = 59,
    REPORT_TO_MOD_KICK_USER = 60,
    REPORT_TO_MOD_BAN_USER = 61,
    REPORT_TO_MOD_CLOSED_REPORT = 62,
    EMOJI_ADDED = 63,
    UNHANDLED = 255,
}

/**
 * https://docs.discord.food/resources/message#partial-message-structure
 */
/*
export type PartialMessage = Pick<Message, "id">
	// & Pick<Message, "lobby_id">
	& Pick<Message, "channel_id">
	& Pick<Message, "type">
	& Pick<Message, "content">
	& Pick<Message, "author">
	& Pick<Message, "flags">
	& Pick<Message, "application_id">
	& { channel?: Channel }
// & Pick<Message, "recipient_id"> // TODO: ephemeral DM channels
	;
 */

export interface PartialMessage {
    id: Snowflake;
    channel_id: string;
    type: MessageType;
    content: string;
    author: PartialUser;
    flags?: number;
    application_id?: string;
    // channel?: Channel; // TODO: ephemeral DM channels
    // recipient_id?: string; // TODO: ephemeral DM channels
}

export interface Reaction {
    count: number;
    //// not saved in the database // me: boolean; // whether the current user reacted using this emoji
    emoji: PartialEmoji;
    user_ids: Snowflake[];
}

// aka { animated } & OneOf<{id},{name}>
export type PartialEmoji =
    | {
          id?: string;
          name: string;
          animated?: boolean;
      }
    | {
          id: string;
          name?: string;
          animated?: boolean;
      };

export interface AllowedMentions {
    parse?: ("users" | "roles" | "everyone")[];
    roles?: Snowflake[];
    users?: Snowflake[];
    replied_user?: boolean;
}

export interface MessageSnapshot {
    message: {
        content: string;
        timestamp: Date;
        edited_timestamp?: Date | null;
        mentions: PartialUser[];
        mention_roles: Snowflake[];
        attachments?: Attachment[];
        embeds: Embed[];
        type: MessageType;
        flags: number;
        components?: MessageComponent[];
        resolved?: object[];
        sticker_items?: Sticker[];
        // soundboard_sounds?: object[]; // TODO: when soundboard is done
    };
}

export interface PublicMessage {
    id: Snowflake;
    channel_id: Snowflake;
    lobby_id?: Snowflake;
    author: PartialUser;
    content: string;
    timestamp: string;
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: PartialUser[];
    mention_roles: Snowflake[];
    mention_channels?: PublicChannel[]; // TODO: PartialPublicChannel
    attachments: PublicAttachment[];
    embeds: Embed[];
    reactions?: Reaction[];
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: Snowflake;
    type: number;
    activity?: MessageActivity;
    // application?: IntegrationApplication; // TODO
    application_id?: Snowflake;
    flags: number;
    message_reference?: MessageReference;
    referenced_message?: PublicMessage | null;
    message_snapshots?: MessageSnapshot[];
    // call?: MessageCall;
    // interaction?: PartialMessageInteraction; // TODO
    // interaction_metadata?: MessageInteraction; // TODO
    // resolved?: ResolvedData; // TODO
    thread?: PublicChannel;
    // role_subscription_data?: MessageRoleSubscription;
    // purchase_notification?: MessagePurchaseNotification;
    // gift_info?: MessageGiftInfo;
    components: MessageComponent[];
    // sticker_items?: StickerItem[]; // TODO: ???
    stickers?: Sticker[]; // TODO: dont use db entity
    poll?: Poll;
    changelog_id?: Snowflake;
    // soundboard_sounds?: SoundboardSound[];
    potions?: Potion[];
    shared_client_theme?: SharedClientTheme;
}

export interface SharedClientTheme {
    colors: string[]; // hex encoded colors, max 5
    gradient_angle: number; // int, degrees
    base_mix: number; //int, 0-100
    base_theme?: ClientBaseThemeType;
}

export enum ClientBaseThemeType {
    DARK = 1,
    LIGHT = 2,
    DARKER = 3,
    MIDNIGHT = 4,
}

export interface Potion {
    used_by: Snowflake;
    type: PotionType;
    emoji: PartialEmoji[];
    created_at: string;
}

export enum PotionType {
    CONFETTI = 0,
}

export interface MessageReference {
    message_id?: string;
    channel_id?: string;
    guild_id?: string;
    fail_if_not_exists?: boolean;
    type?: number;
}
