export const DEFAULT_ARCHIVED_THREAD_LIMIT = 50;
export const MAX_ARCHIVED_THREAD_LIMIT = 100;
export const PUBLIC_ARCHIVED_THREAD_PERMISSIONS = ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"] as const;

const DEFAULT_ARCHIVED_THREAD_ALIAS = "thread";

export const ARCHIVE_PARENT_CHANNEL_TYPES = {
    GUILD_TEXT: 0,
    GUILD_NEWS: 5,
    GUILD_FORUM: 15,
    GUILD_MEDIA: 16,
} as const;

export const ARCHIVED_THREAD_TYPES = {
    GUILD_NEWS_THREAD: 10,
    GUILD_PUBLIC_THREAD: 11,
} as const;

export function parseArchivedThreadLimit(value: string | undefined) {
    if (value === undefined) return DEFAULT_ARCHIVED_THREAD_LIMIT;

    const limit = Number(value);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ARCHIVED_THREAD_LIMIT) throw new RangeError(`limit must be between 1 and ${MAX_ARCHIVED_THREAD_LIMIT}`);

    return limit;
}

export function getPublicArchivedThreadType(parentType: number) {
    if (parentType === ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_NEWS) return ARCHIVED_THREAD_TYPES.GUILD_NEWS_THREAD;
    if (
        parentType === ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_TEXT ||
        parentType === ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_FORUM ||
        parentType === ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_MEDIA
    )
        return ARCHIVED_THREAD_TYPES.GUILD_PUBLIC_THREAD;
}

type QueryParameters = Record<string, unknown>;

export interface ArchivedThreadsQueryBuilder<TBuilder> {
    where(condition: string, parameters?: QueryParameters): TBuilder;
    andWhere(condition: string, parameters?: QueryParameters): TBuilder;
    orderBy(sort: string, order?: "ASC" | "DESC"): TBuilder;
    take(take?: number): TBuilder;
}

export interface PublicArchivedThreadsQueryOptions {
    channelId: string;
    threadType: number;
    beforeDate?: Date;
    take: number;
    alias?: string;
}

export function archivedThreadJsonTextExpression(key: "archived" | "archive_timestamp", alias = DEFAULT_ARCHIVED_THREAD_ALIAS) {
    return `"${alias}"."thread_metadata" ->> '${key}'`;
}

export function archivedThreadArchiveTimestampExpression(alias = DEFAULT_ARCHIVED_THREAD_ALIAS) {
    return `(${archivedThreadJsonTextExpression("archive_timestamp", alias)})::timestamptz`;
}

export function applyPublicArchivedThreadsQuery<TBuilder extends ArchivedThreadsQueryBuilder<TBuilder>>(
    query: TBuilder,
    { alias = DEFAULT_ARCHIVED_THREAD_ALIAS, beforeDate, channelId, take, threadType }: PublicArchivedThreadsQueryOptions,
) {
    const archivedExpression = archivedThreadJsonTextExpression("archived", alias);
    const archiveTimestampExpression = archivedThreadArchiveTimestampExpression(alias);

    let builder = query
        .where(`"${alias}"."parent_id" = :channelId`, { channelId })
        .andWhere(`"${alias}"."type" = :threadType`, { threadType })
        .andWhere(`${archivedExpression} = :archived`, { archived: "true" });

    if (beforeDate) builder = builder.andWhere(`${archiveTimestampExpression} < :before`, { before: beforeDate.toISOString() });

    return builder.orderBy(archiveTimestampExpression, "DESC").take(take);
}
