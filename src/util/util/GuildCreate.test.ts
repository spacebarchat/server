import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getGuildCreateCustomRoles, getGuildCreateEveryoneRole, normalizeGuildCreateRole, resolveGuildCreateChannelReferences } from "./GuildCreate";

describe("guild create normalization", () => {
    test("separates @everyone role overrides from custom roles", () => {
        const roles = [
            { id: "0", permissions: "8" },
            { id: "moderator", name: "Moderator" },
        ];

        assert.deepEqual(getGuildCreateEveryoneRole(roles, "template-guild"), { id: "0", permissions: "8" });
        assert.deepEqual(getGuildCreateCustomRoles(roles, "template-guild"), [{ id: "moderator", name: "Moderator" }]);
    });

    test("recognizes template source guild id as @everyone role", () => {
        const roles = [
            { id: "template-guild", permissions: "1024" },
            { id: "member-role", name: "Member" },
        ];

        assert.deepEqual(getGuildCreateEveryoneRole(roles, "template-guild"), { id: "template-guild", permissions: "1024" });
        assert.deepEqual(getGuildCreateCustomRoles(roles, "template-guild"), [{ id: "member-role", name: "Member" }]);
    });

    test("normalizes sparse role payloads with required defaults", () => {
        assert.deepEqual(
            normalizeGuildCreateRole(
                { name: "Moderator", color: 42 },
                {
                    name: "fallback",
                    permissions: "0",
                    color: 0,
                    colors: { primary_color: 0 },
                    hoist: false,
                    managed: false,
                    mentionable: false,
                    position: 1,
                    flags: 0,
                },
            ),
            {
                name: "Moderator",
                permissions: "0",
                color: 42,
                colors: { primary_color: 42 },
                hoist: false,
                managed: false,
                mentionable: false,
                position: 1,
                flags: 0,
            },
        );
    });

    test("remaps guild create channel references from client ids", () => {
        const ids = new Map([
            ["client-general", "server-general"],
            ["client-rules", "server-rules"],
        ]);

        assert.deepEqual(
            resolveGuildCreateChannelReferences(
                {
                    system_channel_id: "client-general",
                    rules_channel_id: "client-rules",
                    afk_channel_id: "external-afk",
                },
                ids,
            ),
            {
                system_channel_id: "server-general",
                rules_channel_id: "server-rules",
                afk_channel_id: undefined,
            },
        );
    });
});
