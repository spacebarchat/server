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
import { In } from "typeorm";
import { route } from "@spacebar/api";
import { Webhook, Channel, Message } from "@spacebar/database";
import { Config, DiscordApiErrors, getPermission, WebhooksUpdateEvent, emitEvent, handleFile, ValidateName, MessageDeleteBulkEvent } from "@spacebar/util";
import { WebhookUpdateSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        description: "Returns a webhook object for the given id. Requires the MANAGE_WEBHOOKS permission or to be the owner of the webhook.",
        responses: {
            200: {
                body: "APIWebhook",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id } = req.params as { [key: string]: string };
        const webhook = await Webhook.findOneOrFail({
            where: { id: webhook_id },
            relations: { user: true, channel: true, source_channel: true, guild: true, source_guild: true, application: true },
        });

        if (webhook.guild_id) {
            const permission = await getPermission(req.user_id, webhook.guild_id);

            if (!permission.has("MANAGE_WEBHOOKS")) throw DiscordApiErrors.UNKNOWN_WEBHOOK;
        } else if (webhook.user_id != req.user_id) throw DiscordApiErrors.UNKNOWN_WEBHOOK;

        return res.json({
            ...webhook,
            url: Config.get().api.endpointPublic + "/webhooks/" + webhook.id + "/" + webhook.token,
        });
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
        const { webhook_id } = req.params as { [key: string]: string };

        const webhook = await Webhook.findOneOrFail({
            where: { id: webhook_id },
            relations: { user: true, channel: true, source_channel: true, guild: true, source_guild: true, application: true },
        });

        if (webhook.guild_id) {
            const permission = await getPermission(req.user_id, webhook.guild_id);

            if (!permission.has("MANAGE_WEBHOOKS")) throw DiscordApiErrors.UNKNOWN_WEBHOOK;
        } else if (webhook.user_id != req.user_id) throw DiscordApiErrors.UNKNOWN_WEBHOOK;

        const channel_id = webhook.channel_id;
        const channel = await Channel.findOneOrFail({ where: { id: channel_id } });

        // work around foreign key constraint
        while (await Message.count({ where: { webhook_id, channel_id } })) {
            const ids = (await Message.find({ where: { webhook_id, channel_id }, select: { id: true }, order: { id: "asc" }, take: 100 })).map((x) => x.id);
            await Message.delete({ id: In(ids) });
            await emitEvent({
                event: "MESSAGE_DELETE_BULK",
                channel_id,
                origin: "webhook delete",
                data: {
                    channel_id,
                    guild_id: channel.guild_id,
                    ids,
                },
            } satisfies MessageDeleteBulkEvent);
        }

        await Webhook.delete({ id: webhook_id });

        await emitEvent({
            event: "WEBHOOKS_UPDATE",
            channel_id,
            data: {
                channel_id,
                guild_id: webhook.guild_id!, // TODO: is this even the right fix?
            },
        } satisfies WebhooksUpdateEvent);

        res.sendStatus(204);
    },
);

router.patch(
    "/",
    route({
        requestBody: "WebhookUpdateSchema",
        responses: {
            200: {
                body: "WebhookCreateResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id } = req.params as { [key: string]: string };
        const body = req.body as WebhookUpdateSchema;

        const webhook = await Webhook.findOneOrFail({
            where: { id: webhook_id },
            relations: { user: true, channel: true, source_channel: true, guild: true, source_guild: true, application: true },
        });

        if (webhook.guild_id) {
            const permission = await getPermission(req.user_id, webhook.guild_id);

            if (!permission.has("MANAGE_WEBHOOKS")) throw DiscordApiErrors.UNKNOWN_WEBHOOK;
        } else if (webhook.user_id != req.user_id) throw DiscordApiErrors.UNKNOWN_WEBHOOK;

        if (!body.name && !body.avatar && !body.channel_id) {
            throw new HTTPError("Empty webhook updates are not allowed", 50006);
        }

        if (body.avatar) body.avatar = await handleFile(`/avatars/${webhook_id}`, body.avatar as string);

        if (body.name) {
            ValidateName(body.name);
        }

        const channel_id = body.channel_id || webhook.channel_id;
        webhook.assign(body);

        if (body.channel_id)
            webhook.assign({
                channel: await Channel.findOneOrFail({
                    where: { id: channel_id },
                }),
            });

        await Promise.all([
            webhook.save(),
            emitEvent({
                event: "WEBHOOKS_UPDATE",
                channel_id,
                data: {
                    channel_id,
                    guild_id: webhook.guild_id!, //TODO: is this even the right fix?
                },
            } satisfies WebhooksUpdateEvent),
        ]);

        res.json(webhook);
    },
);

export default router;
