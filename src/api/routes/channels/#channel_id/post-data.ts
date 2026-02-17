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

import { handleMessage, postHandleMessage, route, sendMessage } from "@spacebar/api";
import { Channel, emitEvent, User, uploadFile, Attachment, Member, ReadState, MessageCreateEvent, FieldErrors, getPermission, ThreadMember, Message } from "@spacebar/util";
import { ChannelType, MessageType, ThreadCreationSchema, MessageCreateAttachment, MessageCreateCloudAttachment, PostDataSchema } from "@spacebar/schemas";

import { Request, Response, Router } from "express";
import { messageUpload } from "./messages";
import { HTTPError } from "#util/util/lambert-server";
import { FindManyOptions, FindOptionsOrder, In, Like } from "typeorm";

const router = Router({ mergeParams: true });

// TODO: public read receipts & privacy scoping
// TODO: send read state event to all channel members
// TODO: advance-only notification cursor

router.post(
    "/",
    messageUpload.any(),
    (req, res, next) => {
        if (req.body.payload_json) {
            req.body = JSON.parse(req.body.payload_json);
        }

        next();
    },
    route({
        requestBody: "PostDataSchema",
        permission: "VIEW_CHANNEL",
        responses: {
            200: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        const body = (req.body as PostDataSchema).thread_ids;
        const threads = await Channel.find({
            where: {
                id: In(body),
            },
        });
        const [messages, members] = await Promise.all([
            Message.find({
                where: {
                    id: In(threads.map(({ id }) => id)),
                },
                relations: {
                    author: true,
                    webhook: true,
                    application: true,
                    mentions: true,
                    mention_roles: true,
                    mention_channels: true,
                    sticker_items: true,
                    attachments: true,
                    thread: {
                        recipients: {
                            user: true,
                        },
                    },
                },
            }),
            Member.find({
                where: {
                    id: In(threads.map(({ owner_id }) => owner_id)),
                },
            }),
        ]);
        await Message.fillReplies(messages);
        const objRet: { threads: Record<string, { first_message: null | Message; owner: null | Member }> } = { threads: {} };
        for (const thread of threads) {
            const owner = members.find(({ id }) => id === thread.owner_id)?.toJSON() || null;
            const first_message = messages.find(({ channel_id }) => channel_id === thread.id)?.toJSON() || null;
            objRet.threads[thread.id] = {
                owner,
                first_message,
            };
        }
        return res.json(objRet);
    },
);

export default router;
