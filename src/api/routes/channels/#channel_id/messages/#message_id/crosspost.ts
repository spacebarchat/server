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

import { route } from "@spacebar/api";
import { Channel, DiscordApiErrors, Message, MessageUpdateEvent, emitEvent, getPermission, getRights } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { getCrosspostRejectionReason, markMessageCrossposted } from "./crosspostHelpers";

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        permission: "SEND_MESSAGES",
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

        const rejectionReason = getCrosspostRejectionReason(channel.type, message.type);
        if (rejectionReason === "channel_type") throw DiscordApiErrors.CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE;
        if (rejectionReason === "message_type") throw DiscordApiErrors.CANNOT_EXECUTE_ON_SYSTEM_MESSAGE;

        if (message.author_id !== req.user_id) {
            const rights = await getRights(req.user_id);
            if (!rights.has("MANAGE_MESSAGES")) {
                const permission = await getPermission(req.user_id, channel.guild_id, channel_id);
                permission.hasThrow("MANAGE_MESSAGES");
            }
        }

        const nextFlags = markMessageCrossposted(message.flags);
        if (nextFlags !== message.flags) {
            message.flags = nextFlags;
            await message.save();
            await emitEvent({
                event: "MESSAGE_UPDATE",
                channel_id,
                data: message.toJSON(),
            } satisfies MessageUpdateEvent);
        }

        return res.status(200).json(message.toJSON());
    },
);

export default router;
