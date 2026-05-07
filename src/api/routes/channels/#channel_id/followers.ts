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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api";
import { Channel, Config, getPermission, Webhook } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { ChannelFollowerChannel, followAnnouncementChannel } from "../../../util/utility/ChannelFollowers";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        description: "Follows an announcement channel and creates a follower webhook in the target channel.",
        responses: {
            200: {},
            400: {
                body: "APIErrorResponse",
            },
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };
        const { webhook_channel_id } = req.body as { webhook_channel_id?: string };

        if (!webhook_channel_id) throw new HTTPError('"webhook_channel_id" is required', 400);

        const [sourceChannel, targetChannel] = await Promise.all([
            Channel.findOneOrFail({ where: { id: channel_id } }),
            Channel.findOneOrFail({ where: { id: webhook_channel_id } }),
        ]);

        const response = await followAnnouncementChannel({
            userId: req.user_id,
            sourceChannel,
            targetChannel,
            getChannelPermission: (userId: string, guildId: string | undefined, channel: ChannelFollowerChannel) => getPermission(userId, guildId, channel as Channel),
            countTargetWebhooks: (channelId: string) => Webhook.count({ where: { channel_id: channelId } }),
            maxWebhooks: Config.get().limits.channel.maxWebhooks,
            createWebhook: (payload) => Webhook.create(payload).save(),
        });

        return res.json(response);
    },
);

export default router;

/**
 *
 * @param {"webhook_channel_id":"754001514330062952"}
 *
 * Creates a WebHook in the channel and returns the id of it
 *
 * @returns {"channel_id": "816382962056560690", "webhook_id": "834910735095037962"}
 */
