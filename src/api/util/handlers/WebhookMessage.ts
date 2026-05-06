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
import { Attachment, Channel, DiscordApiErrors, emitEvent, Message, MessageDeleteEvent, MessageUpdateEvent, uploadFile, Webhook } from "@spacebar/util";
import { ChannelType, WebhookMessageEditSchema } from "@spacebar/schemas";
import { FindOptionsRelations, FindOptionsWhere } from "typeorm";

type WebhookMessageUploadFile = Pick<Express.Multer.File, "buffer" | "mimetype" | "originalname">;
type WebhookMessageUploader = (path: string, file: WebhookMessageUploadFile) => Promise<Attachment>;
type WebhookMessageEditAttachment = NonNullable<WebhookMessageEditSchema["attachments"]>[number] | Attachment;

export type PreparedWebhookMessageEdit = Omit<WebhookMessageEditSchema, "attachments" | "content" | "embeds" | "components" | "allowed_mentions"> & {
    attachments?: WebhookMessageEditAttachment[];
    allowed_mentions?: Exclude<WebhookMessageEditSchema["allowed_mentions"], null>;
    components?: Exclude<WebhookMessageEditSchema["components"], null>;
    content?: Exclude<WebhookMessageEditSchema["content"], null>;
    embeds?: Exclude<WebhookMessageEditSchema["embeds"], null>;
};

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

export async function getWebhookForToken(webhook_id: string, token: string, relations?: FindOptionsRelations<Webhook>): Promise<Webhook> {
    const webhook = await Webhook.findOne({
        where: {
            id: webhook_id,
        },
        ...(relations ? { relations } : {}),
    });

    assertWebhookToken(webhook, token);
    return webhook;
}

export async function getWebhookMessage(webhook_id: string, message_id: string, thread_id?: string): Promise<Message> {
    const message = await Message.findOne({
        where: getWebhookMessageWhere(webhook_id, message_id, thread_id),
        relations: {
            attachments: true,
            application: true,
            author: true,
            channel: true,
            member: true,
            mention_channels: true,
            mention_roles: true,
            mentions: true,
            sticker_items: true,
            thread: true,
            webhook: true,
        },
    });

    if (!message) {
        throw DiscordApiErrors.UNKNOWN_MESSAGE;
    }

    return message;
}

export async function uploadWebhookMessageFiles(
    channel_id: string,
    message_id: string,
    files: readonly WebhookMessageUploadFile[] = [],
    uploader: WebhookMessageUploader = uploadFile,
): Promise<Attachment[]> {
    const attachments: Attachment[] = [];

    for (const file of files) {
        attachments.push(Object.assign(new Attachment(), await uploader(`/attachments/${channel_id}/${message_id}`, file)));
    }

    return attachments;
}

export function resolveWebhookMessageEditAttachments(
    existingAttachments: readonly Attachment[] = [],
    requestedAttachments: WebhookMessageEditSchema["attachments"],
    uploadedAttachments: readonly Attachment[] = [],
): WebhookMessageEditAttachment[] {
    const retainedAttachments: WebhookMessageEditAttachment[] = [];

    if (requestedAttachments === undefined) {
        retainedAttachments.push(...existingAttachments);
    } else if (requestedAttachments !== null) {
        for (const attachment of requestedAttachments) {
            if ("uploaded_filename" in attachment) {
                retainedAttachments.push(attachment);
                continue;
            }

            const existing = existingAttachments.find((current) => current.id === attachment.id);
            if (existing) {
                retainedAttachments.push(existing);
            }
        }
    }

    return [...retainedAttachments, ...uploadedAttachments];
}

export function normalizeWebhookMessageEditBody(body: WebhookMessageEditSchema): Omit<PreparedWebhookMessageEdit, "attachments"> {
    const { allowed_mentions, attachments: _attachments, components, content, embeds, ...rest } = body;

    return {
        ...rest,
        ...(allowed_mentions !== null && allowed_mentions !== undefined ? { allowed_mentions } : {}),
        ...(components !== null && components !== undefined ? { components } : {}),
        ...(components === null ? { components: [] } : {}),
        ...(content !== null && content !== undefined ? { content } : {}),
        ...(content === null ? { content: "" } : {}),
        ...(embeds !== null && embeds !== undefined ? { embeds } : {}),
        ...(embeds === null ? { embeds: [] } : {}),
    };
}

export async function buildWebhookMessageEditBody(
    message: Pick<Message, "attachments" | "channel_id" | "id">,
    body: WebhookMessageEditSchema,
    files: readonly WebhookMessageUploadFile[] = [],
    uploader: WebhookMessageUploader = uploadFile,
): Promise<PreparedWebhookMessageEdit> {
    if (!message.channel_id) {
        throw DiscordApiErrors.UNKNOWN_MESSAGE;
    }

    return {
        ...normalizeWebhookMessageEditBody(body),
        attachments: resolveWebhookMessageEditAttachments(
            message.attachments ?? [],
            body.attachments,
            await uploadWebhookMessageFiles(message.channel_id, message.id, files, uploader),
        ),
    };
}

export async function editWebhookMessage(message: Message, body: PreparedWebhookMessageEdit): Promise<Message> {
    const newMessage = await handleMessage({
        ...message,
        message_reference: message.message_reference,
        ...body,
        author_id: message.author_id,
        channel_id: message.channel_id,
        id: message.id,
        edited_timestamp: new Date(),
        is_edit: true,
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

export function shouldDecrementWebhookMessageChannel(channel?: Pick<Channel, "type"> | null): boolean {
    return channel?.type === ChannelType.GUILD_PUBLIC_THREAD;
}

export async function deleteWebhookMessage(message: Message): Promise<void> {
    if (!message.channel_id || !message.webhook_id) {
        throw DiscordApiErrors.UNKNOWN_MESSAGE;
    }

    if (shouldDecrementWebhookMessageChannel(message.channel)) {
        if (message.channel.message_count !== undefined) {
            message.channel.message_count = Math.max(0, message.channel.message_count - 1);
        }
        await message.channel.save();
    }

    if (message.attachments?.length) {
        await Attachment.remove(message.attachments);
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
