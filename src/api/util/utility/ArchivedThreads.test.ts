import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    applyPublicArchivedThreadsQuery,
    ARCHIVED_THREAD_TYPES,
    ARCHIVE_PARENT_CHANNEL_TYPES,
    archivedThreadArchiveTimestampExpression,
    archivedThreadJsonTextExpression,
    DEFAULT_ARCHIVED_THREAD_LIMIT,
    getPublicArchivedThreadType,
    MAX_ARCHIVED_THREAD_LIMIT,
    parseArchivedThreadLimit,
    PUBLIC_ARCHIVED_THREAD_PERMISSIONS,
} from "./ArchivedThreads";

describe("archived thread helpers", () => {
    test("requires channel visibility before public archived threads can be read", () => {
        assert.deepEqual(PUBLIC_ARCHIVED_THREAD_PERMISSIONS, ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]);
    });

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

    test("builds public archived thread queries with jsonb predicates and ordering", () => {
        const builder = createFakeQueryBuilder();
        const beforeDate = new Date("2026-01-02T03:04:05.000Z");

        assert.equal(
            applyPublicArchivedThreadsQuery(builder, {
                beforeDate,
                channelId: "channel-id",
                take: 26,
                threadType: ARCHIVED_THREAD_TYPES.GUILD_PUBLIC_THREAD,
            }),
            builder,
        );

        assert.deepEqual(builder.calls, [
            ["where", '"thread"."parent_id" = :channelId', { channelId: "channel-id" }],
            ["andWhere", '"thread"."type" = :threadType', { threadType: ARCHIVED_THREAD_TYPES.GUILD_PUBLIC_THREAD }],
            ["andWhere", `${archivedThreadJsonTextExpression("archived")} = :archived`, { archived: "true" }],
            ["andWhere", `${archivedThreadArchiveTimestampExpression()} < :before`, { before: beforeDate.toISOString() }],
            ["orderBy", archivedThreadArchiveTimestampExpression(), "DESC"],
            ["take", 26],
        ]);
    });

    test("omits public archived thread before predicate when no cursor is provided", () => {
        const builder = createFakeQueryBuilder();

        applyPublicArchivedThreadsQuery(builder, {
            channelId: "channel-id",
            take: 51,
            threadType: ARCHIVED_THREAD_TYPES.GUILD_NEWS_THREAD,
        });

        assert.equal(
            builder.calls.some(([method, condition]) => method === "andWhere" && typeof condition === "string" && condition.includes(":before")),
            false,
        );
        assert.deepEqual(builder.calls.at(-2), ["orderBy", archivedThreadArchiveTimestampExpression(), "DESC"]);
        assert.deepEqual(builder.calls.at(-1), ["take", 51]);
    });
});

type FakeQueryBuilderCall = [string, string, Record<string, unknown>?] | [string, string, string] | [string, number];

function createFakeQueryBuilder() {
    return {
        calls: [] as FakeQueryBuilderCall[],
        where(condition: string, parameters?: Record<string, unknown>) {
            this.calls.push(["where", condition, parameters]);
            return this;
        },
        andWhere(condition: string, parameters?: Record<string, unknown>) {
            this.calls.push(["andWhere", condition, parameters]);
            return this;
        },
        orderBy(sort: string, order?: "ASC" | "DESC") {
            this.calls.push(["orderBy", sort, order ?? "ASC"]);
            return this;
        },
        take(take?: number) {
            this.calls.push(["take", take ?? 0]);
            return this;
        },
    };
}
