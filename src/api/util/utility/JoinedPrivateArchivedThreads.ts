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

export const DEFAULT_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT = 50;
export const MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT = 100;
export const JOINED_PRIVATE_ARCHIVED_THREAD_PERMISSIONS = ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"] as const;

const DEFAULT_THREAD_ALIAS = "thread";
const DEFAULT_THREAD_MEMBER_ALIAS = "thread_member";

export interface JoinedPrivateArchivedThreadMemberRecord {
    id: string;
    join_timestamp: Date | string;
    flags: number;
}

export interface JoinedPrivateArchivedThreadMemberResponse {
    id: string;
    user_id: string;
    join_timestamp: string;
    flags: number;
}

export function parseJoinedPrivateArchivedThreadLimit(value: string | undefined) {
    if (value === undefined) return DEFAULT_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT;

    const limit = Number(value);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT) {
        throw new RangeError(`limit must be between 1 and ${MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT}`);
    }

    return limit;
}

export function parseJoinedPrivateArchivedThreadBefore(value: string | undefined) {
    if (value === undefined) return undefined;

    if (!/^\d+$/.test(value)) throw new RangeError("before must be a thread id");

    return value;
}

type QueryParameters = Record<string, unknown>;

export interface JoinedPrivateArchivedThreadsQueryBuilder<TBuilder> {
    innerJoin(entity: unknown, alias: string, condition: string): TBuilder;
    where(condition: string, parameters?: QueryParameters): TBuilder;
    andWhere(condition: string, parameters?: QueryParameters): TBuilder;
    orderBy(sort: string, order?: "ASC" | "DESC"): TBuilder;
    take(take?: number): TBuilder;
}

export interface JoinedPrivateArchivedThreadsQueryOptions {
    channelId: string;
    memberIndex: string;
    beforeThreadId?: string;
    take: number;
    privateThreadType: number;
    threadAlias?: string;
    threadMemberAlias?: string;
}

export function joinedPrivateArchivedThreadJsonTextExpression(key: "archived", alias = DEFAULT_THREAD_ALIAS) {
    return `"${alias}"."thread_metadata" ->> '${key}'`;
}

export function selectReturnedJoinedPrivateArchivedThreads<TThread>(threads: TThread[], limit: number) {
    return {
        threads: threads.slice(0, limit),
        hasMore: threads.length > limit,
    };
}

export function serializeJoinedPrivateArchivedThreadMember(threadMember: JoinedPrivateArchivedThreadMemberRecord, userId: string): JoinedPrivateArchivedThreadMemberResponse {
    const joinTimestamp = threadMember.join_timestamp instanceof Date ? threadMember.join_timestamp : new Date(threadMember.join_timestamp);

    return {
        id: threadMember.id,
        user_id: userId,
        join_timestamp: joinTimestamp.toISOString(),
        flags: threadMember.flags,
    };
}

export function applyJoinedPrivateArchivedThreadsQuery<TBuilder extends JoinedPrivateArchivedThreadsQueryBuilder<TBuilder>>(
    query: TBuilder,
    {
        beforeThreadId,
        channelId,
        memberIndex,
        privateThreadType,
        take,
        threadAlias = DEFAULT_THREAD_ALIAS,
        threadMemberAlias = DEFAULT_THREAD_MEMBER_ALIAS,
    }: JoinedPrivateArchivedThreadsQueryOptions,
    threadMemberEntity: unknown,
) {
    const archivedExpression = joinedPrivateArchivedThreadJsonTextExpression("archived", threadAlias);

    let builder = query
        .innerJoin(threadMemberEntity, threadMemberAlias, `"${threadMemberAlias}"."id" = "${threadAlias}"."id"`)
        .where(`"${threadAlias}"."parent_id" = :channelId`, { channelId })
        .andWhere(`"${threadAlias}"."type" = :privateThreadType`, { privateThreadType })
        .andWhere(`"${threadMemberAlias}"."member_idx" = :memberIndex`, { memberIndex })
        .andWhere(`${archivedExpression} = :archived`, { archived: "true" });

    if (beforeThreadId) builder = builder.andWhere(`"${threadAlias}"."id" < :before`, { before: beforeThreadId });

    return builder.orderBy(`"${threadAlias}"."id"`, "DESC").take(take);
}
