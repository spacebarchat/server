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

import { Embed, MessageCreateAttachment, MessageCreateCloudAttachment, MessageCreateSchema, MessageType, Reaction } from "@spacebar/schemas";

export type MessageOptionAttachment = MessageCreateAttachment | MessageCreateCloudAttachment | InternalCdnAttachment;

export interface MessageOptions extends MessageCreateSchema {
    id?: string;
    type?: MessageType;
    pinned?: boolean;
    author_id?: string;
    webhook_id?: string;
    application_id?: string;
    embeds?: Embed[] | null;
    reactions?: Reaction[];
    channel_id?: string;
    attachments?: MessageOptionAttachment[];
    edited_timestamp?: Date;
    timestamp?: Date;
    username?: string;
    avatar_url?: string;
}

export interface InternalCdnAttachment {
    id: string;
    channel_id: string;
    message_id: string;
    content_type: string;
    filename: string;
    size: number;
    url: string;
    path: string;
    width?: number;
    height?: number;
}
