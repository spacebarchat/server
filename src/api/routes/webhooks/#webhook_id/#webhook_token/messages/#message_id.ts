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

import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server/HTTPError";
import multer from "multer";
import { handleMessage, postHandleMessage, route } from "@spacebar/api/util";
import { Channel, Message, Webhook } from "@spacebar/database";
import { MessageDeleteEvent, MessageUpdateEvent, emitEvent, DiscordApiErrors } from "@spacebar/util";
import { ChannelType, PublicMessage, WebhookExecuteSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });
// TODO: message content/embed string length limit

async function assertValidWebhookAuth(webhookId: string, webhookToken: string, messageId: string) {
    const webhook = await Webhook.findOne({ where: { id: webhookId } });
    if (!webhook) throw DiscordApiErrors.UNKNOWN_WEBHOOK;
    if (webhook.token != webhookToken) throw DiscordApiErrors.INVALID_WEBHOOK_TOKEN_PROVIDED;

    // TODO: fix error responses
    const message = await Message.findOne({ where: { id: messageId } });
    if (!message) throw new HTTPError(`No message found with ID ${messageId}`, 404);
    if (webhook.id != message?.webhook_id) throw new HTTPError(`Message does not belong to webhook ${message.webhook_id}`, 401);
    if (webhook.channel_id != message?.channel_id) throw new HTTPError(`Message does not belong to webhook channel ${message.channel_id}`, 401);
}

const messageUpload = multer({
    limits: {
        fileSize: 1024 * 1024 * 100,
        fields: 10,
        files: 1,
    },
    storage: multer.memoryStorage(),
}); // max upload 50 mb

router.patch(
    "/",
    route({
        requestBody: "WebhookExecuteSchema",
        responses: {
            200: {
                body: "PublicMessage",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id, webhook_token, message_id } = req.params as { [key: string]: string };
        const body = req.body as WebhookExecuteSchema;

        await assertValidWebhookAuth(webhook_id, webhook_token, message_id);

        const message = await Message.findOneOrFail({
            where: { id: message_id, webhook_id: webhook_id },
            relations: { attachments: true },
        });

        const new_message = await handleMessage({
            ...message,
            // TODO: should message_reference be overridable?
            message_reference: message.message_reference,
            ...body,
            // author_id: message.author_id,
            author_id: undefined, // skip rights check
            webhook_id: message.webhook_id,
            channel_id: message.channel_id,
            id: message_id,
            edited_timestamp: new Date(),
        });

        await new_message.save();
        await emitEvent({
            event: "MESSAGE_UPDATE",
            channel_id: message.channel_id,
            data: {
                ...new_message.toJSON(),
                nonce: undefined,
            },
        } satisfies MessageUpdateEvent);

        postHandleMessage(new_message).catch((e) => console.error("[Message] post-message handler failed", e));

        // TODO: a DTO?
        return res.json({
            ...new_message.toJSON(),
            id: new_message.id,
            type: new_message.type,
            channel_id: new_message.channel_id!,
            // member: new_message.member?.toPublicMember(), // TODO: why was this here? this isnt in the Message object lol
            author: new_message.author!.toPartialUser(),
            attachments: new_message.attachments?.map((x) => x.toJSON()) ?? [],
            embeds: new_message.embeds,
            mentions: new_message.mentions.map((u) => u.toPartialUser()),
            mention_roles: new_message.mention_roles.map((r) => r.id),
            mention_everyone: new_message.mention_everyone ?? false,
            pinned: new_message.pinned,
            timestamp: new_message.timestamp.toISOString(),
            edited_timestamp: new_message.edited_timestamp?.toISOString() ?? null,

            // these are not in the Discord.com response
            mention_channels: new_message.mention_channels.map((x) => x.toJSON()),
        } satisfies PublicMessage);
    },
);

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "PublicMessage",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id, webhook_token, message_id } = req.params as { [key: string]: string };

        await assertValidWebhookAuth(webhook_id, webhook_token, message_id);

        const message = await Message.findOneOrFail({
            where: { id: message_id, webhook_id: webhook_id },
            relations: {
                attachments: true,
                author: true,
            },
        });

        return res.json(message.toJSON());
    },
);

router.delete(
    "/",
    route({
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id, webhook_token, message_id } = req.params as { [key: string]: string };

        await assertValidWebhookAuth(webhook_id, webhook_token, message_id);

        const message = await Message.findOneOrFail({
            where: { id: message_id, webhook_id: webhook_id },
        });

        const channel = await Channel.findOneOrFail({
            where: { id: message.channel_id },
        });

        if (channel.type === ChannelType.GUILD_PUBLIC_THREAD) {
            if (channel.message_count !== undefined) channel.message_count--;
            await channel.save();
        }

        await Message.delete({ id: message_id, webhook_id: webhook_id });

        await emitEvent({
            event: "MESSAGE_DELETE",
            channel_id: message.channel_id,
            data: {
                id: message_id,
                channel_id: message.channel_id!,
                guild_id: channel.guild_id,
            },
        } satisfies MessageDeleteEvent);

        res.sendStatus(204);
    },
);

export default router;
