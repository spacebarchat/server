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

import { AllowedMentions, ApplicationCommandOption, Embed, Snowflake, UploadAttachmentRequestSchema } from "@spacebar/schemas";

export interface InteractionSchema {
    type: InteractionType;
    application_id: Snowflake;
    guild_id?: Snowflake;
    channel_id: Snowflake;
    message_id?: Snowflake;
    message_flags?: number;
    session_id?: string;
    data: InteractionData;
    files?: object[]; // idk the type
    nonce?: string;
    analytics_location?: string;
    section_name?: string;
    source?: string;
}

interface InteractionData {
    application_command: object;
    attachments: UploadAttachmentRequestSchema[];
    id: string;
    name: string;
    options: ApplicationCommandOption[];
    type: number;
    version: string;
}

export interface Interaction {
    id: string;
    type: InteractionType;
    data?: object; // TODO typing
    guild_id: string;
    channel_id: string;
    member_id: string;
    token: string;
    version: number;
}

export enum InteractionType {
    Ping = 1,
    ApplicationCommand = 2,
    MessageComponent = 3,
    ApplicationCommandAutocomplete = 4,
    ModalSubmit = 5,
}

export enum InteractionResponseType {
    SelfCommandResponse = 0,
    Pong = 1,
    Acknowledge = 2,
    ChannelMessage = 3,
    ChannelMessageWithSource = 4,
    AcknowledgeWithSource = 5,
}

export interface InteractionApplicationCommandCallbackData {
    tts?: boolean;
    content: string;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
}
