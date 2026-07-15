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

import crypto from "node:crypto";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server/HTTPError";
import { route } from "@spacebar/api/util/handlers/route";
import { Application, Channel, User, Webhook } from "@spacebar/database";
import { Config, DiscordApiErrors, handleFile, ValidateName } from "@spacebar/util";
import { isTextChannel, WebhookCreateSchema, WebhookResponse, WebhookType } from "@spacebar/schemas";
import { trimSpecial } from "@spacebar/extensions";

const router: Router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        description: "Returns a list of channel webhook objects. Requires the MANAGE_WEBHOOKS permission.",
        permission: "MANAGE_WEBHOOKS",
        responses: {
            200: {
                body: "WebhookArray",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };
        const webhooks = await Webhook.find({
            where: { channel_id },
            relations: { user: true, channel: true, source_channel: true, guild: true, source_guild: true, application: true },
        });

        return res.json(
            webhooks.map(
                (webhook) =>
                    ({
                        ...webhook,
                        user: webhook.user.toPartialUser(),
                        source_guild: webhook.source_guild?.toIntegrationGuild(),
                        source_channel: webhook.source_channel?.toWebhookChannel(),
                        url: Config.get().api.endpointPublic + "/webhooks/" + webhook.id + "/" + webhook.token,
                    }) satisfies WebhookResponse,
            ),
        );
    },
);

// TODO: use Image Data Type for avatar instead of String
router.post(
    "/",
    route({
        requestBody: "WebhookCreateSchema",
        permission: "MANAGE_WEBHOOKS",
        responses: {
            200: {
                body: "WebhookCreateResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };
        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
        });

        isTextChannel(channel.type);
        if (!channel.guild_id) throw new HTTPError("Not a guild channel", 400);

        const webhook_count = await Webhook.count({ where: { channel_id } });
        const { maxWebhooks } = Config.get().limits.channel;
        if (maxWebhooks && webhook_count > maxWebhooks) throw DiscordApiErrors.MAXIMUM_WEBHOOKS.withParams(maxWebhooks);

        let { avatar, name } = req.body as WebhookCreateSchema;
        name = trimSpecial(name);

        // TODO: move this
        if (name) {
            ValidateName(name);
        }

        if (avatar) avatar = await handleFile(`/avatars/${channel_id}`, avatar);

        const hook = await Webhook.create({
            type: WebhookType.Incoming,
            name,
            avatar,
            guild_id: channel.guild_id,
            channel_id: channel.id,
            user_id: req.user_id,
            application: (await Application.findOneBy({ id: req.user_id })) ?? undefined,
            token: crypto.randomBytes(24).toString("base64url"),
        }).save();

        const user = await User.getPublicUser(req.user_id);

        return res.json({
            ...hook,
            user: user,
            url: Config.get().api.endpointPublic + "/api/webhooks/" + hook.id + "/" + hook.token,
        });
    },
);

export default router;
