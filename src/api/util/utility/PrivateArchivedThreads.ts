export const DEFAULT_PRIVATE_ARCHIVED_THREAD_LIMIT = 50;
export const MAX_PRIVATE_ARCHIVED_THREAD_LIMIT = 100;
export const PRIVATE_ARCHIVED_THREAD_PERMISSIONS = ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "MANAGE_THREADS"] as const;

const DEFAULT_THREAD_ALIAS = "thread";

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

    const before = new Date(value);
    if (Number.isNaN(before.getTime())) throw new RangeError("before must be an ISO8601 timestamp");

    return before;
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
