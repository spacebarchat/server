/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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
import { Channel, emitEvent, Member, Permissions, ThreadCreateEvent, ThreadDeleteEvent, ThreadMember, ThreadMemberFlags, ThreadMembersUpdateEvent } from "@spacebar/util";
import { ChannelType, Snowflake } from "@spacebar/schemas";

import { Request, Response, Router } from "express";
import { MoreThan } from "typeorm";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {},
            403: {},
        },
        permission: "VIEW_CHANNEL",
    }),
    async (req: Request, res: Response) => {
        // eslint-disable-next-line prefer-const
        let { with_member, after, limit } = req.query as {
            with_member?: string;
            after?: Snowflake;
            limit?: string;
        };
        const { id: channel_id } = req.params as { [key: string]: string };

        if (limit && parseInt(limit) > 100) limit = "100";

        if (with_member != "true") {
            after = undefined;
            limit = undefined;
        }

        return await ThreadMember.find({
            where: { channel: { id: channel_id }, ...(after ? { user_id: MoreThan(after) } : {}) },
            take: limit ? parseInt(limit) : 50,
            order: { member_idx: "ASC" },
            relations: { ...(with_member ? { member: true } : {}) },
        });
    },
);
router.post(
    "/:user_id",
    route({
        responses: {
            200: {},
            403: {},
        },
        permission: "VIEW_CHANNEL",
    }),
    async (req: Request, res: Response) => {
        // eslint-disable-next-line prefer-const
        let { channel_id, user_id } = req.params as { [key: string]: string };
        const thread = await Channel.findOneOrFail({ where: { id: channel_id } });

        if (user_id != "@me") (await thread.getUserPermissions({ user: req.user, guild: thread.guild })).hasThrow(Permissions.FLAGS.SEND_MESSAGES);
        else {
            user_id = req.user_id;
            if (thread.type === ChannelType.GUILD_PRIVATE_THREAD)
                // TODO what's the actual permission for this?
                (await thread.getUserPermissions({ user: req.user, guild: thread.guild })).hasThrow(Permissions.FLAGS.MANAGE_MESSAGES);
        }

        const member = await Member.findOneOrFail({ where: { id: user_id, guild_id: thread.guild_id! } });
        if (await ThreadMember.existsBy({ member_idx: member.index, id: channel_id })) {
            return res.status(204).send();
        }

        const threadMember = ThreadMember.create({ member_idx: member.index, id: channel_id, join_timestamp: new Date(), muted: false, flags: ThreadMemberFlags.ALL_MESSAGES });
        await threadMember.save();

        // increment member count
        if (thread.member_count !== null && thread.member_count !== undefined) {
            thread.member_count++;
            await thread.save();
        }

        await emitEvent({
            event: "THREAD_MEMBERS_UPDATE",
            data: {
                guild_id: thread.guild_id!,
                id: thread.id,
                member_count: thread.member_count,
                added_member_ids: [user_id],
            },
            channel_id: thread.id,
        } as ThreadMembersUpdateEvent);

        await emitEvent({
            event: "THREAD_CREATE",
            data: { ...thread.toJSON(), newly_created: false },
            user_id: user_id,
        } as ThreadCreateEvent);

        return res.status(204).send();
    },
);

router.delete(
    "/:user_id",
    route({
        responses: {
            200: {},
            403: {},
        },
        permission: "VIEW_CHANNEL",
    }),
    async (req: Request, res: Response) => {
        // eslint-disable-next-line prefer-const
        let { channel_id, user_id } = req.params as { [key: string]: string };
        const thread = await Channel.findOneOrFail({ where: { id: channel_id } });

        // TODO: require thread creator for private threads
        if (user_id != "@me") (await thread.getUserPermissions({ user: req.user, guild: thread.guild })).hasThrow(Permissions.FLAGS.MANAGE_THREADS);
        else user_id = req.user_id;

        const member = await Member.findOneOrFail({ where: { id: user_id, guild_id: thread.guild_id! } });
        const threadMember = await ThreadMember.findOneOrFail({ where: { member_idx: member.index, id: channel_id } });
        await threadMember.remove();

        // decrement member count
        if (thread.member_count !== null && thread.member_count !== undefined && thread.member_count > 0) {
            thread.member_count--;
            await thread.save();
        }

        await emitEvent({
            event: "THREAD_MEMBERS_UPDATE",
            data: {
                guild_id: thread.guild_id!,
                id: thread.id,
                member_count: thread.member_count,
                removed_member_ids: [user_id],
            },
            channel_id: thread.id,
        } as ThreadMembersUpdateEvent);

        await emitEvent({
            event: "THREAD_DELETE",
            data: {
                id: thread.id,
                guild_id: thread.guild_id!,
                parent_id: thread.parent_id!,
                type: thread.type,
            },
            user_id: user_id,
        } as ThreadDeleteEvent);

        return res.status(204).send();
    },
);

router.patch(
    "/@me/settings",
    route({
        responses: {
            200: {},
            403: {},
        },
        permission: "VIEW_CHANNEL",
    }),
    async (req: Request, res: Response) => {
        // TODO
        // eslint-disable-next-line prefer-const
        let { channel_id } = req.params as { [key: string]: string };
        const thread = await Channel.findOneOrFail({ where: { id: channel_id } });
        await Member.IsInGuildOrFail(req.params.user_id as string, thread.guild_id!);
        // var threadMember = await ThreadMember.findOneOrFail({ where: { member_id: req.user_id, id: channel_id } });

        // await emitEvent({
        //     event: "THREAD_MEMBER_UPDATE",
        //     data: ,
        //     user_id: user_id,
        // } as ThreadMemberUpdateEvent);

        return res.status(500).send("not implemented");
    },
);

export default router;
