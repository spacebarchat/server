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
import { ChannelType, MessageType, ThreadCreationSchema, MessageCreateAttachment, MessageCreateCloudAttachment } from "@spacebar/schemas";

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
        requestBody: "ThreadCreationSchema",
        permission: "CREATE_PUBLIC_THREADS",
        responses: {
            200: {},
            403: {},
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: check for differences with https://github.com/spacebarchat/server/pull/876/files#diff-95be9c4cdfd8ba6f67361cd40b9abc8226b35d83e2bb44bf5b4682f1d66155e9
        const { channel_id } = req.params as { [key: string]: string };
        const body = req.body as ThreadCreationSchema;

        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
        });
        const user = await User.findOneOrFail({ where: { id: req.user_id } });

        const thread = await Channel.createChannel(
            {
                owner: user,
                parent: channel,
                guild: channel.guild,
                member_count: 1,
                message_count: body.message ? 1 : 0,
                total_message_sent: body.message ? 1 : 0,
                name: body.name,
                guild_id: channel.guild_id,
                rate_limit_per_user: body.rate_limit_per_user,
                type: body.type || (channel.threadOnly() ? ChannelType.GUILD_PUBLIC_THREAD : ChannelType.GUILD_PRIVATE_THREAD),
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

        await Promise.all([
            emitEvent({
                event: "THREAD_CREATE",
                channel_id,
                data: {
                    ...thread.toJSON(),
                    newly_created: true,
                },
            }),
        ]);
        if (body.type !== ChannelType.GUILD_PRIVATE_THREAD)
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
        if (body.message) {
            const files = (req.files as Express.Multer.File[]) ?? [];
            const attachments: (Attachment | MessageCreateAttachment | MessageCreateCloudAttachment)[] = body.message.attachments ?? [];
            for (const currFile of files) {
                try {
                    const file = await uploadFile(`/attachments/${channel.id}`, currFile);
                    attachments.push(Attachment.create({ ...file, proxy_url: file.url }));
                } catch (error) {
                    return res.status(400).json({ message: error?.toString() });
                }
            }
            const embeds = body.message.embeds || [];
            const message = await handleMessage({
                ...body.message,
                id: thread.id,
                type: 0,
                pinned: false,
                author_id: req.user_id,
                embeds,
                channel_id: thread.id,
                attachments,
                timestamp: new Date(),
            });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore wrong type but idk why it's mad
            message.edited_timestamp = null;
            if (message.guild_id) {
                // handleMessage will fetch the Member, but only if they are not guild owner.
                // have to fetch ourselves otherwise.
                if (!message.member) {
                    message.member = await Member.findOneOrFail({
                        where: { id: req.user_id, guild_id: message.guild_id },
                        relations: { roles: true },
                    });
                }

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                message.member.roles = message.member.roles.filter((x) => x.id != x.guild_id).map((x) => x.id);
            }
            let read_state = await ReadState.findOne({
                where: { user_id: req.user_id, channel_id },
            });
            if (!read_state) read_state = ReadState.create({ user_id: req.user_id, channel_id });
            read_state.last_message_id = message.id;
            //It's a little more complicated than this but this'll do
            read_state.mention_count = 0;

            await Promise.all([
                read_state.save(),
                message.save(),
                emitEvent({
                    event: "MESSAGE_CREATE",
                    channel_id: channel_id,
                    data: message,
                } as MessageCreateEvent),
                message.guild_id ? Member.update({ id: req.user_id, guild_id: message.guild_id }, { last_message_id: message.id }) : null,
            ]);
            postHandleMessage(message).catch((e) => console.error("[Message] post-message handler failed", e));
        }

        return res.json(thread.toJSON());
    },
);

router.get(
    "/search",
    route({
        responses: {
            200: {
                body: "GuildMessagesSearchResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
            422: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { name, slop, tag, tag_setting, archived, sort_by, sort_order, limit, offset, max_id, min_id } = req.query as Record<string, string>;
        const { channel_id } = req.params as Record<string, string>;

        const parsedLimit = Number(limit) || 25;
        if (parsedLimit < 1 || parsedLimit > 25) throw new HTTPError("limit must be between 1 and 25", 422);

        let order: FindOptionsOrder<Channel>;
        switch (sort_by) {
            case undefined:
            case "creation_time":
                order = {
                    created_at: sort_order === "asc" ? "ASC" : "DESC",
                };
                break;
            case "last_message_time":
                order = {
                    last_message_id: sort_order === "asc" ? "ASC" : "DESC",
                };
                break;
            default:
                throw FieldErrors({
                    sort_by: {
                        message: "Value must be one of ('last_message_time', 'archive_time', 'relevance', 'creation_time').",
                        code: "BASE_TYPE_CHOICES",
                    },
                }); // todo this is wrong
        }
        const channel = await Channel.findOneOrFail({
            where: {
                id: channel_id,
            },
        });

        const permissions = await getPermission(req.user_id, channel.guild_id, channel);
        permissions.hasThrow("VIEW_CHANNEL");
        if (!permissions.has("READ_MESSAGE_HISTORY")) return res.json({ threads: [], total_results: 0, members: [], has_more: false, first_messages: [] });
        const member = await Member.findOneOrFail({ where: { guild_id: channel.guild_id, id: req.user_id } });

        const query: FindManyOptions<Channel> = {
            order,
            where: {
                parent_id: channel_id,
                ...(name ? { name: Like(`%${name}%`) } : {}),
                ...(archived
                    ? {
                          thread_metadata: {
                              archived: archived === "true" ? true : false,
                          },
                      }
                    : {}),
            },
            relations: {},
        };

        const threads: Channel[] = await Channel.find({ ...query, take: parsedLimit || 0, skip: offset ? Number(offset) : 0 });
        const total_results = await Channel.count(query);

        const members = ThreadMember.find({
            where: {
                member_idx: member.index,
                id: In(threads.map(({ id }) => id)),
            },
        });

        const messages = Message.find({
            where: {
                id: In(threads.map(({ id }) => id)),
            },
        });

        const left = total_results - threads.length - +offset;
        return res.json({
            threads: threads.map((_) => _.toJSON()),
            members: (await members).map((_) => _.toJSON()),
            messages: (await messages).map((_) => _.toJSON()),
            total_results,
            has_more: left > 0,
        });
    },
);

export default router;
