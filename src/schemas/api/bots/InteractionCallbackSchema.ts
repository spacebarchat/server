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

import { Message } from "@spacebar/util";
import { InteractionCallbackType } from "./InteractionCallbackType";
import { AllowedMentions, BaseMessageComponents, Embed, MessageComponentType } from "../messages";
import { MessageCreateAttachment, MessageCreateCloudAttachment, PollCreationSchema } from "#schemas/uncategorised";

export interface InteractionCallbackSchema {
    type: InteractionCallbackType;
    data: unknown;
}
export interface PongCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.PONG;
}
export interface AckCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.ACKNOWLEDGE;
}
export interface MessageCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.CHANNEL_MESSAGE;
}
export interface MessageWSourceCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE;
    data: InteractionMessage;
}
export interface MessageDWSourceCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
    data: InteractionMessage;
}
export interface MessageUpdateCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.UPDATE_MESSAGE;
    data: InteractionMessage;
}
export interface MessageDUpdateCallback extends InteractionCallbackSchema {
    type: InteractionCallbackType.DEFERRED_UPDATE_MESSAGE;
    data: InteractionMessage;
}
export type InteractionCallbacksSchema =
    | PongCallback
    | AckCallback
    | MessageCallback
    | MessageWSourceCallback
    | MessageDWSourceCallback
    | MessageUpdateCallback
    | MessageDUpdateCallback;

export interface InteractionMessage {
    content?: string;
    tts?: boolean;
    embeds?: Embed[];
    allowed_mentions?: AllowedMentions;
    components?: BaseMessageComponents[];
    flags?: number;
    attachments?: (MessageCreateAttachment | MessageCreateCloudAttachment)[];
    poll?: PollCreationSchema;
}
