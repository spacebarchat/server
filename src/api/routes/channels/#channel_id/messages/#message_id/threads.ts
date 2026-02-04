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

import { route, sendMessage } from "@spacebar/api";
import { Message, Channel, emitEvent, User, MessageUpdateEvent, Recipient } from "@spacebar/util";
import { MessageThreadCreationSchema, ChannelType, MessageType } from "@spacebar/schemas";

import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

// TODO: public read receipts & privacy scoping
// TODO: send read state event to all channel members
// TODO: advance-only notification cursor

router.post(
    "/",
    route({
        requestBody: "MessageThreadCreationSchema",
        permission: "CREATE_PUBLIC_THREADS",
        responses: {
            200: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: check for differences with https://github.com/spacebarchat/server/pull/876/files#diff-95be9c4cdfd8ba6f67361cd40b9abc8226b35d83e2bb44bf5b4682f1d66155e9
        const { message_id, channel_id } = req.params;
        const body = req.body as MessageThreadCreationSchema;
        const message = await Message.findOneOrFail({
            where: { id: message_id, channel_id },
            relations: ["guild"],
        });
        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
        });
        const user = await User.findOneOrFail({ where: { id: req.user_id } });

        const thread = await Channel.createChannel(
            {
                id: message.id,
                owner: user,
                parent: channel,
                guild: channel.guild,
                member_count: 1,
                message_count: 1,
                total_message_sent: 1,
                name: body.name,
                guild_id: channel.guild_id,
                rate_limit_per_user: body.rate_limit_per_user,
                type: channel.type === ChannelType.GUILD_NEWS ? ChannelType.GUILD_NEWS_THREAD : ChannelType.GUILD_PUBLIC_THREAD,
                recipients: [],
                thread_metadata: {
                    archived: false,
                    auto_archive_duration: body.auto_archive_duration || channel.default_auto_archive_duration || 4320,
                    archive_timestamp: new Date().toISOString(),
                    locked: false,
                    create_timestamp: new Date().toISOString(),
                },
            },
            void 0,
            { skipPermissionCheck: true, keepId: true, skipEventEmit: true },
        );

        message.thread = thread;
        message.flags ||= 1 << 5;
        await sendMessage({
            channel_id: thread.id,
            type: MessageType.THREAD_STARTER_MESSAGE,
            message_reference: {
                message_id: message.id,
                channel_id: channel.id,
                guild_id: channel.guild_id,
            },
            author_id: user.id,
        });
        sendMessage({
            channel_id: channel.id,
            type: MessageType.THREAD_CREATED,
            content: thread.name,
            message_reference: {
                channel_id: thread.id,
                guild_id: thread.guild_id,
            },
            author_id: user.id,
        });
        await Promise.all([
            emitEvent({
                event: "THREAD_CREATE",
                channel_id,
                data: {
                    ...thread.toJSON(),
                    newly_created: true,
                },
            }),
            message.save(),
            emitEvent({
                event: "MESSAGE_UPDATE",
                channel_id: message.channel_id,
                data: message.toJSON(),
            } as MessageUpdateEvent),
        ]);

        return res.json(thread.toJSON());
    },
);

export default router;
