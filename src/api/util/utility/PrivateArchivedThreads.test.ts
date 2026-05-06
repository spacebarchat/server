import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    applyPrivateArchivedThreadsQuery,
    DEFAULT_PRIVATE_ARCHIVED_THREAD_LIMIT,
    MAX_PRIVATE_ARCHIVED_THREAD_LIMIT,
    parsePrivateArchivedThreadBefore,
    parsePrivateArchivedThreadLimit,
    privateArchivedThreadArchiveTimestampExpression,
    privateArchivedThreadJsonTextExpression,
    PRIVATE_ARCHIVED_THREAD_PERMISSIONS,
} from "./PrivateArchivedThreads";

describe("private archived thread helpers", () => {
    test("requires visibility, message history, and thread management before private archived threads can be read", () => {
        assert.deepEqual(PRIVATE_ARCHIVED_THREAD_PERMISSIONS, ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "MANAGE_THREADS"]);
    });

    test("defaults private archived thread limit", () => {
        assert.equal(parsePrivateArchivedThreadLimit(undefined), DEFAULT_PRIVATE_ARCHIVED_THREAD_LIMIT);
    });

    test("accepts private archived thread limits in range", () => {
        assert.equal(parsePrivateArchivedThreadLimit("1"), 1);
        assert.equal(parsePrivateArchivedThreadLimit(String(MAX_PRIVATE_ARCHIVED_THREAD_LIMIT)), MAX_PRIVATE_ARCHIVED_THREAD_LIMIT);
    });

    test("rejects private archived thread limits outside range", () => {
        assert.throws(() => parsePrivateArchivedThreadLimit("0"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadLimit(String(MAX_PRIVATE_ARCHIVED_THREAD_LIMIT + 1)), RangeError);
        assert.throws(() => parsePrivateArchivedThreadLimit("1.5"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadLimit("not-a-number"), RangeError);
    });

    test("parses optional before timestamp", () => {
        assert.equal(parsePrivateArchivedThreadBefore(undefined), undefined);
        assert.equal(parsePrivateArchivedThreadBefore("2026-01-02T03:04:05.000Z")?.toISOString(), "2026-01-02T03:04:05.000Z");
    });

    test("rejects invalid before timestamp", () => {
        assert.throws(() => parsePrivateArchivedThreadBefore("not-a-date"), RangeError);
    });

    test("builds private archived thread queries with jsonb predicates and archive timestamp ordering", () => {
        const builder = createFakeQueryBuilder();
        const beforeDate = new Date("2026-01-02T03:04:05.000Z");

        assert.equal(
            applyPrivateArchivedThreadsQuery(builder, {
                beforeDate,
                channelId: "channel-id",
                privateThreadType: 12,
                take: 26,
            }),
            builder,
        );

        assert.deepEqual(builder.calls, [
            ["where", '"thread"."parent_id" = :channelId', { channelId: "channel-id" }],
            ["andWhere", '"thread"."type" = :privateThreadType', { privateThreadType: 12 }],
            ["andWhere", `${privateArchivedThreadJsonTextExpression("archived")} = :archived`, { archived: "true" }],
            ["andWhere", `${privateArchivedThreadArchiveTimestampExpression()} < :before`, { before: beforeDate.toISOString() }],
            ["orderBy", privateArchivedThreadArchiveTimestampExpression(), "DESC"],
            ["take", 26],
        ]);
    });

    test("omits before predicate when no cursor is provided", () => {
        const builder = createFakeQueryBuilder();

        applyPrivateArchivedThreadsQuery(builder, {
            channelId: "channel-id",
            privateThreadType: 12,
            take: 51,
        });

        assert.equal(
            builder.calls.some(([method, condition]) => method === "andWhere" && typeof condition === "string" && condition.includes(":before")),
            false,
        );
        assert.deepEqual(builder.calls.at(-2), ["orderBy", privateArchivedThreadArchiveTimestampExpression(), "DESC"]);
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
