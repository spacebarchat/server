/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

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

import { InteractionType, Snowflake } from "@spacebar/util";
import { ActionRowComponent, ApplicationCommandType, Embed, PollAnswer, PollMedia, PublicUser } from "@spacebar/schemas";

export type MessageCreateAttachment = {
    id: string;
    filename: string;
};

export type MessageCreateCloudAttachment = {
    id?: string;
    filename: string;
    uploaded_filename: string;
    original_content_type?: string;
};

export interface MessageCreateSchema {
    type?: number;
    content?: string;
    mobile_network_type?: string;
    nonce?: string;
    channel_id?: string;
    tts?: boolean;
    flags?: number;
    embeds?: Embed[];
    embed?: Embed;
    // TODO: ^ embed is deprecated in favor of embeds (https://discord.com/developers/docs/resources/channel#message-object)
    allowed_mentions?: {
        parse?: string[];
        roles?: string[];
        users?: string[];
        replied_user?: boolean;
    };
    message_reference?: {
        message_id: string;
        channel_id?: string;
        guild_id?: string;
        fail_if_not_exists?: boolean;
    };
    payload_json?: string;
    file?: { filename: string };
    /**
	TODO: we should create an interface for attachments
	TODO: OpenWAAO<-->attachment-style metadata conversion
	**/
    attachments?: (MessageCreateAttachment | MessageCreateCloudAttachment)[];
    sticker_ids?: string[] | null; // null check: fixes Discord-Go
    components?: ActionRowComponent[] | null; // null check: fixes Discord-Go
    // TODO: Fix TypeScript errors in src\api\util\handlers\Message.ts once this is enabled
    poll?: PollCreationSchema;
    enforce_nonce?: boolean; // For Discord compatibility, it's the default behavior here
    applied_tags?: string[]; // Not implemented yet, for webhooks in forums
    thread_name?: string; // Not implemented yet, for webhooks
    avatar_url?: string; // Not implemented yet, for webhooks
    interaction?: MessageInteractionSchema;
    interaction_metadata?: MessageInteractionSchema;
}

// TypeScript complains once this is used above
export interface PollCreationSchema {
    question: PollMedia;
    answers: PollAnswer[];
    duration?: number;
    allow_multiselect?: boolean;
    layout_type?: number;
}

interface MessageInteractionSchema {
    id: string;
    type: InteractionType;
    name: string;
    command_type?: ApplicationCommandType;
    ephemerality_reason?: number;
    user?: PublicUser; // It has to be optional cause LSP gives an errors for some reason
    user_id?: string;
    authorizing_integration_owners?: object; // It has to be optional cause LSP gives an errors for some reason
    original_response_message_id?: Snowflake;
    interacted_message_id?: Snowflake;
    triggering_interaction_metadata?: MessageInteractionSchema;
    target_user?: PublicUser;
    target_message_id?: Snowflake;
}
