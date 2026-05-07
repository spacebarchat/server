/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { route } from "@spacebar/api";
import { Channel, Member, ThreadMember } from "@spacebar/util";
import { ChannelType } from "@spacebar/schemas";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";
import {
    applyJoinedPrivateArchivedThreadsQuery,
    JOINED_PRIVATE_ARCHIVED_THREAD_PERMISSIONS,
    parseJoinedPrivateArchivedThreadBefore,
    parseJoinedPrivateArchivedThreadLimit,
    selectReturnedJoinedPrivateArchivedThreads,
    serializeJoinedPrivateArchivedThreadMember,
} from "../../../../../../../util/utility/JoinedPrivateArchivedThreads";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        permission: [...JOINED_PRIVATE_ARCHIVED_THREAD_PERMISSIONS],
        query: {
            before: {
                type: "string",
                required: false,
                description: "Return joined private threads with ids before this thread id.",
            },
            limit: {
                type: "number",
                required: false,
                description: "Maximum number of joined private archived threads to return.",
            },
        },
        responses: {
            200: {},
            400: {
                body: "APIErrorResponse",
            },
            403: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };
        const { before, limit } = req.query as Record<string, string | undefined>;

        let parsedLimit: number;
        let beforeThreadId: string | undefined;
        try {
            parsedLimit = parseJoinedPrivateArchivedThreadLimit(limit);
            beforeThreadId = parseJoinedPrivateArchivedThreadBefore(before);
        } catch (error) {
            throw new HTTPError(error instanceof Error ? error.message : "Invalid joined private archived thread query", 400);
        }

        const parentChannel = await Channel.findOneOrFail({ where: { id: channel_id }, select: { guild_id: true, id: true } });
        const member = await Member.findOneOrFail({ where: { guild_id: parentChannel.guild_id!, id: req.user_id }, select: { index: true } });

        const threads = await applyJoinedPrivateArchivedThreadsQuery(
            Channel.createQueryBuilder("thread"),
            {
                beforeThreadId,
                channelId: channel_id,
                memberIndex: member.index,
                privateThreadType: ChannelType.GUILD_PRIVATE_THREAD,
                take: parsedLimit + 1,
            },
            ThreadMember,
        ).getMany();

        const { threads: returnedThreads, hasMore } = selectReturnedJoinedPrivateArchivedThreads(threads, parsedLimit);
        const threadIds = returnedThreads.map(({ id }) => id);
        const members = threadIds.length
            ? await ThreadMember.find({
                  where: {
                      member_idx: member.index,
                      id: In(threadIds),
                  },
              })
            : [];
        const membersByThreadId = new Map(members.map((threadMember) => [threadMember.id, threadMember]));

        return res.json({
            threads: returnedThreads.map((thread) => thread.toJSON()),
            members: threadIds
                .map((threadId) => membersByThreadId.get(threadId))
                .filter((threadMember): threadMember is ThreadMember => threadMember !== undefined)
                .map((threadMember) => serializeJoinedPrivateArchivedThreadMember(threadMember, req.user_id)),
            has_more: hasMore,
        });
    },
);

export default router;
