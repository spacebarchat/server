/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

export const DEFAULT_PRIVATE_ARCHIVED_THREAD_LIMIT = 50;
export const MAX_PRIVATE_ARCHIVED_THREAD_LIMIT = 100;
export const PRIVATE_ARCHIVED_THREAD_PERMISSIONS = ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "MANAGE_THREADS"] as const;

const DEFAULT_THREAD_ALIAS = "thread";
const ISO8601_TIMESTAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/;

export function parsePrivateArchivedThreadLimit(value: string | undefined) {
    if (value === undefined) return DEFAULT_PRIVATE_ARCHIVED_THREAD_LIMIT;

    const limit = Number(value);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PRIVATE_ARCHIVED_THREAD_LIMIT) {
        throw new RangeError(`limit must be between 1 and ${MAX_PRIVATE_ARCHIVED_THREAD_LIMIT}`);
    }

    return limit;
}

export function parsePrivateArchivedThreadBefore(value: string | undefined) {
    if (value === undefined) return undefined;

    if (!isIso8601Timestamp(value)) throw new RangeError("before must be an ISO8601 timestamp");

    const before = new Date(value);
    if (Number.isNaN(before.getTime())) throw new RangeError("before must be an ISO8601 timestamp");

    return before;
}

export interface PrivateArchivedThreadMemberLike {
    id: string;
    join_timestamp: Date | string;
    flags: number;
}

export interface PrivateArchivedThreadMember {
    id: string;
    user_id: string;
    join_timestamp: string;
    flags: number;
}

export function serializePrivateArchivedThreadMember(threadMember: PrivateArchivedThreadMemberLike, userId: string): PrivateArchivedThreadMember {
    const joinTimestamp = threadMember.join_timestamp instanceof Date ? threadMember.join_timestamp : new Date(threadMember.join_timestamp);
    if (Number.isNaN(joinTimestamp.getTime())) throw new RangeError("thread member join_timestamp must be a valid timestamp");

    return {
        id: threadMember.id,
        user_id: userId,
        join_timestamp: joinTimestamp.toISOString(),
        flags: threadMember.flags,
    };
}

type QueryParameters = Record<string, unknown>;

export interface PrivateArchivedThreadsQueryBuilder<TBuilder> {
    where(condition: string, parameters?: QueryParameters): TBuilder;
    andWhere(condition: string, parameters?: QueryParameters): TBuilder;
    orderBy(sort: string, order?: "ASC" | "DESC"): TBuilder;
    take(take?: number): TBuilder;
}

export interface PrivateArchivedThreadsQueryOptions {
    channelId: string;
    privateThreadType: number;
    beforeDate?: Date;
    take: number;
    alias?: string;
}

export function privateArchivedThreadJsonTextExpression(key: "archived" | "archive_timestamp", alias = DEFAULT_THREAD_ALIAS) {
    return `"${alias}"."thread_metadata" ->> '${key}'`;
}

export function privateArchivedThreadArchiveTimestampExpression(alias = DEFAULT_THREAD_ALIAS) {
    return `(${privateArchivedThreadJsonTextExpression("archive_timestamp", alias)})::timestamptz`;
}

export function applyPrivateArchivedThreadsQuery<TBuilder extends PrivateArchivedThreadsQueryBuilder<TBuilder>>(
    query: TBuilder,
    { alias = DEFAULT_THREAD_ALIAS, beforeDate, channelId, privateThreadType, take }: PrivateArchivedThreadsQueryOptions,
) {
    const archivedExpression = privateArchivedThreadJsonTextExpression("archived", alias);
    const archiveTimestampExpression = privateArchivedThreadArchiveTimestampExpression(alias);

    let builder = query
        .where(`"${alias}"."parent_id" = :channelId`, { channelId })
        .andWhere(`"${alias}"."type" = :privateThreadType`, { privateThreadType })
        .andWhere(`${archivedExpression} = :archived`, { archived: "true" });

    if (beforeDate) builder = builder.andWhere(`${archiveTimestampExpression} < :before`, { before: beforeDate.toISOString() });

    return builder.orderBy(archiveTimestampExpression, "DESC").take(take);
}

function isIso8601Timestamp(value: string) {
    const match = ISO8601_TIMESTAMP_PATTERN.exec(value);
    if (!match) return false;

    const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue, offsetHourValue, offsetMinuteValue] = match;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const hour = Number(hourValue);
    const minute = Number(minuteValue);
    const second = Number(secondValue);
    const offsetHour = offsetHourValue === undefined ? 0 : Number(offsetHourValue);
    const offsetMinute = offsetMinuteValue === undefined ? 0 : Number(offsetMinuteValue);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return false;
    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    if (second < 0 || second > 59) return false;
    if (offsetHour < 0 || offsetHour > 23) return false;
    if (offsetMinute < 0 || offsetMinute > 59) return false;

    return true;
}
