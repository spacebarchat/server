import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    ARCHIVED_THREAD_TYPES,
    ARCHIVE_PARENT_CHANNEL_TYPES,
    DEFAULT_ARCHIVED_THREAD_LIMIT,
    getPublicArchivedThreadType,
    MAX_ARCHIVED_THREAD_LIMIT,
    parseArchivedThreadLimit,
} from "./ArchivedThreads";

describe("archived thread helpers", () => {
    test("defaults archived thread limit", () => {
        assert.equal(parseArchivedThreadLimit(undefined), DEFAULT_ARCHIVED_THREAD_LIMIT);
    });

    test("accepts archived thread limits in range", () => {
        assert.equal(parseArchivedThreadLimit("1"), 1);
        assert.equal(parseArchivedThreadLimit(String(MAX_ARCHIVED_THREAD_LIMIT)), MAX_ARCHIVED_THREAD_LIMIT);
    });

    test("rejects archived thread limits outside range", () => {
        assert.throws(() => parseArchivedThreadLimit("0"), RangeError);
        assert.throws(() => parseArchivedThreadLimit(String(MAX_ARCHIVED_THREAD_LIMIT + 1)), RangeError);
        assert.throws(() => parseArchivedThreadLimit("1.5"), RangeError);
    });

    test("resolves public archived thread type from parent channel type", () => {
        assert.equal(getPublicArchivedThreadType(ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_TEXT), ARCHIVED_THREAD_TYPES.GUILD_PUBLIC_THREAD);
        assert.equal(getPublicArchivedThreadType(ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_FORUM), ARCHIVED_THREAD_TYPES.GUILD_PUBLIC_THREAD);
        assert.equal(getPublicArchivedThreadType(ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_MEDIA), ARCHIVED_THREAD_TYPES.GUILD_PUBLIC_THREAD);
        assert.equal(getPublicArchivedThreadType(ARCHIVE_PARENT_CHANNEL_TYPES.GUILD_NEWS), ARCHIVED_THREAD_TYPES.GUILD_NEWS_THREAD);
    });

    test("rejects parent channel types without public archived threads", () => {
        assert.equal(getPublicArchivedThreadType(2), undefined);
    });
});
