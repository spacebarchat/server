import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { describe, test } from "node:test";
import express from "express";
import {
    applyPrivateArchivedThreadsQuery,
    DEFAULT_PRIVATE_ARCHIVED_THREAD_LIMIT,
    MAX_PRIVATE_ARCHIVED_THREAD_LIMIT,
    parsePrivateArchivedThreadBefore,
    parsePrivateArchivedThreadLimit,
    privateArchivedThreadArchiveTimestampExpression,
    privateArchivedThreadJsonTextExpression,
    PRIVATE_ARCHIVED_THREAD_PERMISSIONS,
    serializePrivateArchivedThreadMember,
} from "./PrivateArchivedThreads";

const SKIP_ROUTE_TEST_UNDER_COVERAGE =
    process.execArgv.includes("--experimental-test-coverage") || process.env.npm_lifecycle_event === "node:tests"
        ? "Node coverage cannot resolve source maps for route paths containing #channel_id"
        : false;

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
        assert.equal(parsePrivateArchivedThreadBefore("2026-01-02T03:04:05+00:00")?.toISOString(), "2026-01-02T03:04:05.000Z");
    });

    test("rejects invalid before timestamp", () => {
        assert.throws(() => parsePrivateArchivedThreadBefore("not-a-date"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadBefore("1"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadBefore("March 1 2026"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadBefore("2026-01-02"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadBefore("2026-02-30T00:00:00.000Z"), RangeError);
        assert.throws(() => parsePrivateArchivedThreadBefore("2026-01-01T24:00:00.000Z"), RangeError);
    });

    test("serializes private archived thread members with public user IDs", () => {
        const persistedThreadMember = {
            id: "thread-id",
            join_timestamp: new Date("2026-01-02T03:04:05.000Z"),
            flags: 2,
            index: "internal-index",
            member_idx: "internal-member-index",
        };

        assert.deepEqual(serializePrivateArchivedThreadMember(persistedThreadMember, "user-id"), {
            id: "thread-id",
            user_id: "user-id",
            join_timestamp: "2026-01-02T03:04:05.000Z",
            flags: 2,
        });
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

    test("private archived route returns public member objects and pagination state", { skip: SKIP_ROUTE_TEST_UNDER_COVERAGE }, async (t) => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar_route_test";

        const routeHandler = require("../handlers/route") as {
            route: (options: RouteOptionsWithPermission) => express.RequestHandler;
        };
        const { Channel, Member, ThreadMember } = require("@spacebar/util") as typeof import("@spacebar/util");
        const routeModulePath = require.resolve("../../routes/channels/#channel_id/threads");
        const originalRoute = routeHandler.route;
        const capturedRouteOptions: RouteOptionsWithPermission[] = [];

        routeHandler.route = (options) => {
            capturedRouteOptions.push(options);
            return (_req, _res, next) => next();
        };
        delete require.cache[routeModulePath];

        try {
            const queryBuilder = createFakeQueryBuilder({
                getMany: async () => [
                    {
                        id: "thread-new",
                        toJSON: () => ({ id: "thread-new", type: 12 }),
                    },
                    {
                        id: "thread-extra",
                        toJSON: () => ({ id: "thread-extra", type: 12 }),
                    },
                ],
            });
            let threadMemberFindOptions: { where?: { member_idx?: string } } | undefined;

            t.mock.method(Channel, "findOneOrFail", async () => ({ id: "parent-channel", guild_id: "guild-id" }));
            t.mock.method(Channel, "createQueryBuilder", () => queryBuilder);
            t.mock.method(Member, "findOne", async () => ({ index: "member-index" }));
            t.mock.method(ThreadMember, "find", async (options: { where?: { member_idx?: string } }) => {
                threadMemberFindOptions = options;
                return [
                    {
                        id: "thread-new",
                        join_timestamp: new Date("2026-01-02T03:04:05.000Z"),
                        flags: 2,
                        index: "internal-index",
                        member_idx: "member-index",
                    },
                ];
            });

            const router = require(routeModulePath).default as express.Router;
            const app = express();
            app.use((req, _res, next) => {
                (req as express.Request & { user_id: string }).user_id = "user-id";
                next();
            });
            app.use("/channels/:channel_id/threads", router);

            const response = await requestJson(app, "/channels/parent-channel/threads/archived/private?limit=1&before=2026-01-03T00:00:00.000Z");
            const privateArchivedRouteOptions = capturedRouteOptions.find((options) => Array.isArray(options.permission));

            assert.equal(response.status, 200);
            assert.deepEqual(privateArchivedRouteOptions?.permission, [...PRIVATE_ARCHIVED_THREAD_PERMISSIONS]);
            assert.deepEqual(queryBuilder.calls.at(-1), ["take", 2]);
            assert.equal(threadMemberFindOptions?.where?.member_idx, "member-index");
            assert.deepEqual(response.body, {
                threads: [{ id: "thread-new", type: 12 }],
                members: [
                    {
                        id: "thread-new",
                        user_id: "user-id",
                        join_timestamp: "2026-01-02T03:04:05.000Z",
                        flags: 2,
                    },
                ],
                has_more: true,
            });
        } finally {
            routeHandler.route = originalRoute;
            delete require.cache[routeModulePath];
        }
    });
});

type FakeQueryBuilderCall = [string, string, Record<string, unknown>?] | [string, string, string] | [string, number];

type RouteOptionsWithPermission = {
    permission?: unknown;
};

function createFakeQueryBuilder(extraMethods: Record<string, unknown> = {}) {
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
        ...extraMethods,
    };
}

async function requestJson(app: express.Express, path: string) {
    const server = app.listen(0);
    try {
        const address = server.address() as AddressInfo;
        const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
        return {
            status: response.status,
            body: await response.json(),
        };
    } finally {
        server.close();
    }
}
