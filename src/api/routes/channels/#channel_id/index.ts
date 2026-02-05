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
import { Channel, ChannelDeleteEvent, ChannelUpdateEvent, Recipient, emitEvent, handleFile } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { ChannelModifySchema, ChannelType } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });
// TODO: delete channel
// TODO: Get channel

router.get(
    "/",
    route({
        permission: "VIEW_CHANNEL",
        responses: {
            200: {
                body: "Channel",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };

        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
        });
        if (!channel.guild_id) return res.send(channel);

        channel.position = await Channel.calculatePosition(channel_id, channel.guild_id, channel.guild);
        return res.send(channel);
    },
);

router.delete(
    "/",
    route({
        permission: "MANAGE_CHANNELS",
        responses: {
            200: {
                body: "Channel",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };

        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
            relations: { recipients: true },
        });

        if (channel.type === ChannelType.DM) {
            const recipient = await Recipient.findOneOrFail({
                where: { channel_id: channel_id, user_id: req.user_id },
            });
            recipient.closed = true;
            await Promise.all([
                recipient.save(),
                emitEvent({
                    event: "CHANNEL_DELETE",
                    data: channel,
                    user_id: req.user_id,
                } as ChannelDeleteEvent),
            ]);
        } else if (channel.type === ChannelType.GROUP_DM) {
            await Channel.removeRecipientFromChannel(channel, req.user_id);
        } else if (channel.isThread()) {
            await Promise.all([
                Channel.delete({ id: channel_id }),
                emitEvent({
                    event: "THREAD_DELETE",
                    data: {
                        id: channel_id,
                        guild_id: channel.guild_id,
                        parent_id: channel.parent_id,
                        type: channel.type,
                    },
                    guild_id: channel.guild_id,
                }),
            ]);
        } else {
            if (channel.type == ChannelType.GUILD_CATEGORY) {
                const channels = await Channel.find({
                    where: { parent_id: channel_id },
                });
                for await (const c of channels) {
                    c.parent_id = null;

                    await Promise.all([
                        c.save(),
                        emitEvent({
                            event: "CHANNEL_UPDATE",
                            data: c,
                            channel_id: c.id,
                        } as ChannelUpdateEvent),
                    ]);
                }
            }

            await Promise.all([
                Channel.deleteChannel(channel),
                emitEvent({
                    event: "CHANNEL_DELETE",
                    data: channel,
                    channel_id,
                } as ChannelDeleteEvent),
            ]);
        }

        res.send(channel);
    },
);

router.patch(
    "/",
    route({
        requestBody: "ChannelModifySchema",
        permission: "VIEW_CHANNEL",
        responses: {
            200: {
                body: "Channel",
            },
            404: {},
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const payload = req.body as ChannelModifySchema;
        const { channel_id } = req.params as { [key: string]: string };
        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
            relations: payload.available_tags ? ["available_tags"] : [],
        });

        if (channel.isThread()) {
            if (channel.owner_id !== req.user.id) {
                req.permission!.hasThrow("MANAGE_THREADS");
            }
            if (payload.permission_overwrites) {
                //TODO better error maybe?
                throw new Error("You can't change permission overwrites for threads");
            }
        } else {
            req.permission!.hasThrow("MANAGE_CHANNELS");
        }

        if (payload.available_tags) {
            if (channel.isForum() && channel.available_tags) {
                //TODO maybe error if this fails, and maybe handle creating tags?
                const filter = new Set(payload.available_tags.map(({ id }) => id));
                const tags = channel.available_tags.filter((_) => !filter.has(_.id));
                tags.forEach((_) => _.remove());
                channel.available_tags = channel.available_tags.filter((_) => filter.has(_.id));
            }
        }
        if (payload.applied_tags) {
            if (channel.isThread()) {
                const parent = await Channel.findOneOrFail({
                    where: {
                        id: channel.parent_id as string,
                    },
                    relations: ["available_tags"],
                });
                if (!parent.available_tags) throw new Error("shoot, internetal error");
                const realTags = new Map(parent.available_tags.map((tag) => [tag.id, tag]));
                const bad = payload.applied_tags.find((tag) => !realTags.has(tag));
                //TODO better error
                if (bad) throw new Error("Invalid tag " + bad);
                const permsNeeded = payload.applied_tags.find((_) => realTags.get(_)?.moderated);
                if (permsNeeded) {
                    req.permission?.hasThrow("MANAGE_THREADS");
                }
            } else {
                //TODO maybe error instead?
                payload.applied_tags = undefined;
            }
        }

        if (payload.icon) payload.icon = await handleFile(`/channel-icons/${channel_id}`, payload.icon);

        channel.assign(payload);
        if (channel.thread_metadata) {
            if (payload.archived !== undefined) {
                channel.thread_metadata.archived = payload.archived;
                channel.thread_metadata.archive_timestamp = new Date().toISOString();
            }
            if (payload.locked !== undefined) channel.thread_metadata.locked = payload.locked;
            if (payload.auto_archive_duration !== undefined) channel.thread_metadata.auto_archive_duration = payload.auto_archive_duration;
            if (payload.invitable !== undefined) channel.thread_metadata.invitable = payload.invitable;
            if (payload.locked !== undefined) {
                req.permission!.hasThrow("MANAGE_THREADS");
                channel.thread_metadata.locked = payload.locked;
            }
        }

        await Promise.all([
            channel.save(),
            emitEvent({
                event: "CHANNEL_UPDATE",
                data: channel,
                channel_id,
            } as ChannelUpdateEvent),
        ]);

        res.send(channel);
    },
);

export default router;
