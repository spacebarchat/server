import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Channel } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { deleteAdminChannel } from "./mutations";
import { AdminChannelType, assertAdminChannelDeletionSupported, createAdminThreadDeleteEvent, parseAdminDiscoveryGuildUpdate, parseAdminForceJoinInput } from "./mutationPolicy";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

describe("admin mutation helpers", () => {
    test("parses only supported discovery update fields", () => {
        assert.deepEqual(parseAdminDiscoveryGuildUpdate({ discoveryExcluded: true, discoveryWeight: 7 }), {
            discoveryExcluded: true,
            discoveryWeight: 7,
        });
        assert.deepEqual(parseAdminDiscoveryGuildUpdate({ discovery_excluded: false, discovery_weight: 3 }), {
            discoveryExcluded: false,
            discoveryWeight: 3,
        });

        assert.throws(
            () => parseAdminDiscoveryGuildUpdate({}),
            (error) => error instanceof HTTPError && error.code === 400,
        );
        assert.throws(
            () => parseAdminDiscoveryGuildUpdate({ discoveryWeight: Number.NaN }),
            (error) => error instanceof HTTPError && error.code === 400,
        );
    });

    test("does not silently reinterpret DM deletion as an admin delete", () => {
        assert.throws(
            () => assertAdminChannelDeletionSupported({ type: AdminChannelType.DM } as never),
            (error) => error instanceof HTTPError && error.code === 400,
        );
        assert.throws(
            () => assertAdminChannelDeletionSupported({ type: AdminChannelType.GROUP_DM } as never),
            (error) => error instanceof HTTPError && error.code === 400,
        );

        assert.doesNotThrow(() => assertAdminChannelDeletionSupported({ type: AdminChannelType.GUILD_TEXT } as never));
    });

    test("builds thread delete events with the gateway payload shape", () => {
        assert.deepEqual(
            createAdminThreadDeleteEvent({
                id: "10",
                guild_id: "20",
                parent_id: "30",
                type: AdminChannelType.GUILD_PUBLIC_THREAD,
            } as never),
            {
                event: "THREAD_DELETE",
                data: {
                    id: "10",
                    guild_id: "20",
                    parent_id: "30",
                    type: AdminChannelType.GUILD_PUBLIC_THREAD,
                },
                guild_id: "20",
            },
        );
    });

    test("deletes guild channels through the channel entity and emits CHANNEL_DELETE", async () => {
        const originalFindOne = Channel.findOne;
        const originalDeleteChannel = Channel.deleteChannel;
        const channel = {
            id: "10",
            guild_id: "20",
            type: AdminChannelType.GUILD_TEXT,
            isThread: () => false,
            toJSON: () => ({ id: "10", guild_id: "20", type: AdminChannelType.GUILD_TEXT }),
        } as never;
        const events: unknown[] = [];
        let deletedChannelId: string | null = null;

        try {
            Channel.findOne = (async () => channel) as typeof Channel.findOne;
            Channel.deleteChannel = (async (deleted: Channel) => {
                deletedChannelId = deleted.id;
            }) as typeof Channel.deleteChannel;

            const result = await deleteAdminChannel("10", async (event) => {
                events.push(event);
            });

            assert.equal(deletedChannelId, "10");
            assert.deepEqual(result, {
                id: "10",
                guildId: "20",
                event: "CHANNEL_DELETE",
                detachedChildChannelIds: [],
            });
            assert.deepEqual(events, [
                {
                    event: "CHANNEL_DELETE",
                    data: { id: "10", guild_id: "20", type: AdminChannelType.GUILD_TEXT },
                    channel_id: "10",
                },
            ]);
        } finally {
            Channel.findOne = originalFindOne;
            Channel.deleteChannel = originalDeleteChannel;
        }
    });

    test("parses force-join options and gives ownership precedence over admin role grants", () => {
        assert.deepEqual(parseAdminForceJoinInput({ userId: " 123 ", makeOwner: true, makeAdmin: true }), {
            userId: "123",
            makeOwner: true,
            makeAdmin: false,
        });
        assert.deepEqual(parseAdminForceJoinInput({ makeAdmin: true }), {
            userId: undefined,
            makeOwner: false,
            makeAdmin: true,
        });
    });
});
