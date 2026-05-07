import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    applyJoinedPrivateArchivedThreadsQuery,
    DEFAULT_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT,
    joinedPrivateArchivedThreadJsonTextExpression,
    JOINED_PRIVATE_ARCHIVED_THREAD_PERMISSIONS,
    MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT,
    parseJoinedPrivateArchivedThreadBefore,
    parseJoinedPrivateArchivedThreadLimit,
    selectReturnedJoinedPrivateArchivedThreads,
    serializeJoinedPrivateArchivedThreadMember,
} from "./JoinedPrivateArchivedThreads";

describe("joined private archived thread helpers", () => {
    test("requires channel visibility and message history before joined private archived threads can be read", () => {
        assert.deepEqual(JOINED_PRIVATE_ARCHIVED_THREAD_PERMISSIONS, ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]);
    });

    test("defaults joined private archived thread limit", () => {
        assert.equal(parseJoinedPrivateArchivedThreadLimit(undefined), DEFAULT_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT);
    });

    test("accepts joined private archived thread limits in range", () => {
        assert.equal(parseJoinedPrivateArchivedThreadLimit("1"), 1);
        assert.equal(parseJoinedPrivateArchivedThreadLimit(String(MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT)), MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT);
    });

    test("rejects joined private archived thread limits outside range", () => {
        assert.throws(() => parseJoinedPrivateArchivedThreadLimit("0"), RangeError);
        assert.throws(() => parseJoinedPrivateArchivedThreadLimit(String(MAX_JOINED_PRIVATE_ARCHIVED_THREAD_LIMIT + 1)), RangeError);
        assert.throws(() => parseJoinedPrivateArchivedThreadLimit("1.5"), RangeError);
        assert.throws(() => parseJoinedPrivateArchivedThreadLimit("not-a-number"), RangeError);
    });

    test("parses optional before cursor", () => {
        assert.equal(parseJoinedPrivateArchivedThreadBefore(undefined), undefined);
        assert.equal(parseJoinedPrivateArchivedThreadBefore("123456789012345678"), "123456789012345678");
    });

    test("rejects invalid before cursor", () => {
        assert.throws(() => parseJoinedPrivateArchivedThreadBefore("not-a-thread-id"), RangeError);
        assert.throws(() => parseJoinedPrivateArchivedThreadBefore("123.4"), RangeError);
    });

    test("builds joined private archived thread queries with membership, jsonb predicates, and id ordering", () => {
        const builder = createFakeQueryBuilder();
        const threadMemberEntity = Symbol("ThreadMember");

        assert.equal(
            applyJoinedPrivateArchivedThreadsQuery(
                builder,
                {
                    beforeThreadId: "123456789012345678",
                    channelId: "channel-id",
                    memberIndex: "member-index",
                    privateThreadType: 12,
                    take: 26,
                },
                threadMemberEntity,
            ),
            builder,
        );

        assert.deepEqual(builder.calls, [
            ["innerJoin", threadMemberEntity, "thread_member", '"thread_member"."id" = "thread"."id"'],
            ["where", '"thread"."parent_id" = :channelId', { channelId: "channel-id" }],
            ["andWhere", '"thread"."type" = :privateThreadType', { privateThreadType: 12 }],
            ["andWhere", '"thread_member"."member_idx" = :memberIndex', { memberIndex: "member-index" }],
            ["andWhere", `${joinedPrivateArchivedThreadJsonTextExpression("archived")} = :archived`, { archived: "true" }],
            ["andWhere", '"thread"."id" < :before', { before: "123456789012345678" }],
            ["orderBy", '"thread"."id"', "DESC"],
            ["take", 26],
        ]);
    });

    test("omits before predicate when no cursor is provided", () => {
        const builder = createFakeQueryBuilder();

        applyJoinedPrivateArchivedThreadsQuery(
            builder,
            {
                channelId: "channel-id",
                memberIndex: "member-index",
                privateThreadType: 12,
                take: 51,
            },
            "ThreadMember",
        );

        assert.equal(
            builder.calls.some(([method, condition]) => method === "andWhere" && typeof condition === "string" && condition.includes(":before")),
            false,
        );
        assert.deepEqual(builder.calls.at(-2), ["orderBy", '"thread"."id"', "DESC"]);
        assert.deepEqual(builder.calls.at(-1), ["take", 51]);
    });

    test("selects one extra joined private archived thread only to compute has_more", () => {
        assert.deepEqual(selectReturnedJoinedPrivateArchivedThreads(["3", "2", "1"], 2), {
            threads: ["3", "2"],
            hasMore: true,
        });
        assert.deepEqual(selectReturnedJoinedPrivateArchivedThreads(["2", "1"], 2), {
            threads: ["2", "1"],
            hasMore: false,
        });
    });

    test("serializes joined private archived thread members with public user ids instead of internal member indexes", () => {
        const serialized = serializeJoinedPrivateArchivedThreadMember(
            {
                id: "thread-id",
                join_timestamp: new Date("2026-05-06T09:00:00.000Z"),
                flags: 2,
            },
            "user-id",
        );

        assert.deepEqual(serialized, {
            id: "thread-id",
            user_id: "user-id",
            join_timestamp: "2026-05-06T09:00:00.000Z",
            flags: 2,
        });
        assert.equal("member_idx" in serialized, false);
    });
});

type FakeQueryBuilderCall = [string, unknown, string, string] | [string, string, Record<string, unknown>?] | [string, string, string] | [string, number];

function createFakeQueryBuilder() {
    return {
        calls: [] as FakeQueryBuilderCall[],
        innerJoin(entity: unknown, alias: string, condition: string) {
            this.calls.push(["innerJoin", entity, alias, condition]);
            return this;
        },
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
