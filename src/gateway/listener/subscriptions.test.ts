import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { isEventRouteSubscribed, trackGuildEventId, trackGuildMemberEventId, unsubscribeEventIds, unsubscribeGuildEventIds, unsubscribeGuildMemberEventIds } from "./subscriptions";

describe("unsubscribeEventIds", () => {
    test("cancels and removes each subscribed event id once", async () => {
        const cancelled: string[] = [];
        const events = {
            guild: async () => cancelled.push("guild"),
            channel: async () => cancelled.push("channel"),
        };

        await unsubscribeEventIds(events, ["guild", "channel", "channel", "missing"]);

        assert.deepEqual(cancelled.sort(), ["channel", "guild"]);
        assert.deepEqual(events, {});
    });

    test("removes subscriptions before awaiting cancellation", async () => {
        const events: Record<string, () => Promise<void>> = {};
        events.guild = async () => {
            assert.equal(events.guild, undefined);
        };

        await unsubscribeEventIds(events, ["guild"]);

        assert.deepEqual(events, {});
    });
});

describe("unsubscribeGuildEventIds", () => {
    test("cancels guild and channel ids from tracked memory before awaiting cancellation", async () => {
        const cancelled: string[] = [];
        const resolvers: Array<() => void> = [];
        const events = Object.fromEntries(
            ["guild", "channel-a", "channel-b"].map((id) => [
                id,
                async () => {
                    cancelled.push(id);
                    await new Promise<void>((resolve) => {
                        resolvers.push(resolve);
                    });
                },
            ]),
        );
        const guildEventIds: Record<string, Set<string>> = {};
        trackGuildEventId(guildEventIds, "guild", "guild");
        trackGuildEventId(guildEventIds, "guild", "channel-a");
        trackGuildEventId(guildEventIds, "guild", "channel-b");

        const unsubscribe = unsubscribeGuildEventIds(events, guildEventIds, "guild");

        assert.deepEqual(events, {});
        assert.deepEqual(guildEventIds, {});
        assert.deepEqual(cancelled.sort(), ["channel-a", "channel-b", "guild"]);

        resolvers.forEach((resolve) => resolve());
        await unsubscribe;
    });
});

describe("isEventRouteSubscribed", () => {
    test("checks the event route id selected by the emitter", () => {
        const events = {
            channel: async () => undefined,
            user: async () => undefined,
        };

        assert.equal(isEventRouteSubscribed(events, { channel_id: "channel" }), true);
        assert.equal(isEventRouteSubscribed(events, { channel_id: "missing" }), false);
        assert.equal(isEventRouteSubscribed(events, { user_id: "user" }), true);
        assert.equal(isEventRouteSubscribed(events, { session_id: "missing" }), false);
        assert.equal(isEventRouteSubscribed(events, {}), true);
    });
});

describe("unsubscribeGuildMemberEventIds", () => {
    test("removes only the leaving guild source and preserves shared member subscriptions", async () => {
        const cancelled: string[] = [];
        const memberEvents = {
            user1: async () => cancelled.push("user1"),
            user2: async () => cancelled.push("user2"),
        };
        const guildMemberEventIds: Record<string, Set<string>> = {};
        const memberEventGuildIds: Record<string, Set<string>> = {};
        trackGuildMemberEventId(guildMemberEventIds, memberEventGuildIds, "guild-a", "user1");
        trackGuildMemberEventId(guildMemberEventIds, memberEventGuildIds, "guild-a", "user2");
        trackGuildMemberEventId(guildMemberEventIds, memberEventGuildIds, "guild-b", "user2");

        await unsubscribeGuildMemberEventIds(memberEvents, guildMemberEventIds, memberEventGuildIds, "guild-a");

        assert.deepEqual(cancelled, ["user1"]);
        assert.deepEqual(Object.keys(memberEvents), ["user2"]);
        assert.deepEqual(guildMemberEventIds, { "guild-b": new Set(["user2"]) });
        assert.deepEqual(memberEventGuildIds, { user2: new Set(["guild-b"]) });

        await unsubscribeGuildMemberEventIds(memberEvents, guildMemberEventIds, memberEventGuildIds, "guild-b");

        assert.deepEqual(cancelled, ["user1", "user2"]);
        assert.deepEqual(memberEvents, {});
        assert.deepEqual(guildMemberEventIds, {});
        assert.deepEqual(memberEventGuildIds, {});
    });

    test("removes one guild member source without dropping other users from the guild", async () => {
        const cancelled: string[] = [];
        const memberEvents = {
            user1: async () => cancelled.push("user1"),
            user2: async () => cancelled.push("user2"),
        };
        const guildMemberEventIds: Record<string, Set<string>> = {};
        const memberEventGuildIds: Record<string, Set<string>> = {};
        trackGuildMemberEventId(guildMemberEventIds, memberEventGuildIds, "guild", "user1");
        trackGuildMemberEventId(guildMemberEventIds, memberEventGuildIds, "guild", "user2");

        await unsubscribeGuildMemberEventIds(memberEvents, guildMemberEventIds, memberEventGuildIds, "guild", ["user1"]);

        assert.deepEqual(cancelled, ["user1"]);
        assert.deepEqual(Object.keys(memberEvents), ["user2"]);
        assert.deepEqual(guildMemberEventIds, { guild: new Set(["user2"]) });
        assert.deepEqual(memberEventGuildIds, { user2: new Set(["guild"]) });
    });
});
