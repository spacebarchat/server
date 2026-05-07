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
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";
import {
    applyPublicArchivedThreadsQuery,
    getPublicArchivedThreadType,
    parseArchivedThreadLimit,
    PUBLIC_ARCHIVED_THREAD_PERMISSIONS,
} from "../../../../../util/utility/ArchivedThreads";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        permission: [...PUBLIC_ARCHIVED_THREAD_PERMISSIONS],
        query: {
            before: {
                type: "string",
                required: false,
                description: "Return threads archived before this ISO8601 timestamp.",
            },
            limit: {
                type: "number",
                required: false,
                description: "Maximum number of archived threads to return.",
            },
        },
        responses: {
            200: {
                body: "ArchivedThreadsResponse",
            },
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
        try {
            parsedLimit = parseArchivedThreadLimit(limit);
        } catch (error) {
            throw new HTTPError(error instanceof Error ? error.message : "Invalid archived thread limit", 400);
        }

        const beforeDate = before ? new Date(before) : undefined;
        if (beforeDate && Number.isNaN(beforeDate.getTime())) throw new HTTPError("before must be an ISO8601 timestamp", 400);

        const channel = await Channel.findOneOrFail({ where: { id: channel_id } });
        const threadType = getPublicArchivedThreadType(channel.type);
        if (threadType === undefined) throw new HTTPError("Cannot list public archived threads for this channel type", 400);

        const threads = await applyPublicArchivedThreadsQuery(Channel.createQueryBuilder("thread"), {
            beforeDate,
            channelId: channel_id,
            take: parsedLimit + 1,
            threadType,
        }).getMany();

        const returnedThreads = threads.slice(0, parsedLimit);
        const member = channel.guild_id ? await Member.findOne({ where: { guild_id: channel.guild_id, id: req.user_id }, select: { index: true } }) : null;
        const members = member
            ? await ThreadMember.find({
                  where: {
                      member_idx: member.index,
                      id: In(returnedThreads.map(({ id }) => id)),
                  },
              })
            : [];

        return res.json({
            threads: returnedThreads.map((thread) => thread.toJSON()),
            members: members.map((threadMember) => threadMember.toJSON()),
            has_more: threads.length > parsedLimit,
        });
    },
);

export default router;
