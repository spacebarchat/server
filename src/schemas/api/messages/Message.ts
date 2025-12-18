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
import { Embed, MessageComponent, PartialUser, Snowflake } from "@spacebar/schemas";

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
    ENCRYPTED = 16,
    REPLY = 19,
    APPLICATION_COMMAND = 20, // application command or self command invocation
    ROUTE_ADDED = 41, // custom message routing: new route affecting that channel
    ROUTE_DISABLED = 42, // custom message routing: given route no longer affecting that channel
    SELF_COMMAND_SCRIPT = 43, // self command scripts
    ENCRYPTION = 50,
    CUSTOM_START = 63,
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

export interface PartialEmoji {
    id?: string;
    name: string;
    animated?: boolean;
}

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
		mentions: Snowflake[];
		mention_roles: Snowflake[];
		attachments?: Attachment[];
		embeds: Embed[];
		type: MessageType;
		flags: number;
		components?: MessageComponent[];
		resolved?: object[];
		sticker_items?: Sticker[];
		// soundboard_sounds?: object[]; // TODO: when soundboard is done
	}
}
