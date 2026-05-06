export const DEFAULT_ARCHIVED_THREAD_LIMIT = 50;
export const MAX_ARCHIVED_THREAD_LIMIT = 100;

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
