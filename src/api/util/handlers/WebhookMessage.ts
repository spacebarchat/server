/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { handleMessage, postHandleMessage } from "@spacebar/api";
import { DiscordApiErrors, emitEvent, Message, MessageDeleteEvent, MessageUpdateEvent, Webhook } from "@spacebar/util";
import { MessageEditSchema } from "@spacebar/schemas";
import { FindOptionsWhere } from "typeorm";

export function assertWebhookToken(webhook: Pick<Webhook, "token"> | null | undefined, token: string): asserts webhook is Pick<Webhook, "token"> {
    if (!webhook) {
        throw DiscordApiErrors.UNKNOWN_WEBHOOK;
    }

    if (webhook.token !== token) {
        throw DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED;
    }
}

export function getWebhookMessageWhere(webhook_id: string, message_id: string, thread_id?: string): FindOptionsWhere<Message> {
    return {
        id: message_id,
        webhook_id,
        ...(thread_id ? { channel_id: thread_id } : {}),
    };
}

export async function getWebhookForToken(webhook_id: string, token: string): Promise<Webhook> {
    const webhook = await Webhook.findOne({
        where: {
            id: webhook_id,
        },
    });

    assertWebhookToken(webhook, token);
    return webhook;
}

export async function getWebhookMessage(webhook_id: string, message_id: string, thread_id?: string): Promise<Message> {
    return await Message.findOneOrFail({
        where: getWebhookMessageWhere(webhook_id, message_id, thread_id),
        relations: {
            attachments: true,
            author: true,
            member: true,
        },
    });
}

export async function editWebhookMessage(message: Message, body: MessageEditSchema): Promise<Message> {
    const newMessage = await handleMessage({
        ...message,
        message_reference: message.message_reference,
        ...body,
        author_id: message.author_id,
        channel_id: message.channel_id,
        id: message.id,
        edited_timestamp: new Date(),
    });

    await newMessage.save();
    await emitEvent({
        event: "MESSAGE_UPDATE",
        channel_id: newMessage.channel_id,
        data: {
            ...newMessage.toJSON(),
            nonce: undefined,
        },
    } satisfies MessageUpdateEvent);

    postHandleMessage(newMessage).catch((e) => console.error("[WebhookMessage] post-message handler failed", e));
    return newMessage;
}

export async function deleteWebhookMessage(message: Message): Promise<void> {
    if (!message.channel_id || !message.webhook_id) {
        throw DiscordApiErrors.UNKNOWN_MESSAGE;
    }

    await Message.delete({ id: message.id, webhook_id: message.webhook_id });
    await emitEvent({
        event: "MESSAGE_DELETE",
        channel_id: message.channel_id,
        data: {
            id: message.id,
            channel_id: message.channel_id,
            guild_id: message.guild_id,
        },
    } satisfies MessageDeleteEvent);
}
