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

import { Attachment, Role } from "../../util/entities";
import { BaseMessageComponents, Embed, MessageType, Poll, PublicUser } from "@spacebar/schemas";

export interface GuildMessagesSearchMessage {
    id: string;
    type: MessageType;
    content?: string;
    channel_id: string;
    author: PublicUser;
    attachments: Attachment[];
    embeds: Embed[];
    mentions: PublicUser[];
    mention_roles: Role[];
    pinned: boolean;
    mention_everyone?: boolean;
    tts: boolean;
    timestamp: string;
    edited_timestamp: string | null;
    flags: number;
    components: BaseMessageComponents[];
    poll: Poll;
    hit: true;
}

export interface GuildMessagesSearchResponse {
    messages: GuildMessagesSearchMessage[];
    total_results: number;
}
