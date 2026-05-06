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

import { CROSSPOST_BASE_PERMISSION, crosspostMessage, route } from "@spacebar/api";
import { Channel, Message, emitEvent, getRights } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        permission: CROSSPOST_BASE_PERMISSION,
        responses: {
            200: {
                body: "Message",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id, message_id } = req.params as { [key: string]: string };

        const [channel, message] = await Promise.all([
            Channel.findOneOrFail({ where: { id: channel_id } }),
            Message.findOneOrFail({
                where: { id: message_id, channel_id },
                relations: {
                    attachments: true,
                    author: true,
                    mentions: true,
                    mention_roles: true,
                    mention_channels: true,
                },
            }),
        ]);

        const response = await crosspostMessage({
            channel,
            channelId: channel_id,
            emitEvent,
            getRights,
            message,
            permission: req.permission!,
            userId: req.user_id,
        });

        return res.status(200).json(response);
    },
);

export default router;
