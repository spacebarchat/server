import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    getGuildCreateCustomRoles,
    getGuildCreateEveryoneRole,
    normalizeGuildCreateRole,
    resolveGuildCreateChannelReferences,
    resolveGuildCreatePermissionOverwrites,
} from "./GuildCreate";

const rolePermissionOverwriteType = 0;
const memberPermissionOverwriteType = 1;

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

    test("uses modern primary role color as the legacy color when color is omitted", () => {
        assert.deepEqual(
            normalizeGuildCreateRole(
                {
                    name: "Gradient",
                    colors: {
                        primary_color: 123,
                        secondary_color: null,
                        tertiary_color: 456,
                    },
                },
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
                name: "Gradient",
                permissions: "0",
                color: 123,
                colors: { primary_color: 123, tertiary_color: 456 },
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

    test("remaps guild create role permission overwrites from client ids", () => {
        const roleIds = new Map([
            ["0", "server-guild"],
            ["template-guild", "server-guild"],
            ["client-moderator", "server-moderator"],
        ]);

        const permissionOverwrites = [
            { id: "0", type: rolePermissionOverwriteType, allow: "1", deny: "0" },
            { id: "template-guild", type: rolePermissionOverwriteType, allow: "2", deny: "0" },
            { id: "client-moderator", type: rolePermissionOverwriteType, allow: "4", deny: "0" },
            { id: "user-id", type: memberPermissionOverwriteType, allow: "8", deny: "0" },
            { id: "external-role", type: rolePermissionOverwriteType, allow: "16", deny: "0" },
        ];

        assert.deepEqual(resolveGuildCreatePermissionOverwrites(permissionOverwrites, roleIds), [
            { id: "server-guild", type: rolePermissionOverwriteType, allow: "1", deny: "0" },
            { id: "server-guild", type: rolePermissionOverwriteType, allow: "2", deny: "0" },
            { id: "server-moderator", type: rolePermissionOverwriteType, allow: "4", deny: "0" },
            { id: "user-id", type: memberPermissionOverwriteType, allow: "8", deny: "0" },
            { id: "external-role", type: rolePermissionOverwriteType, allow: "16", deny: "0" },
        ]);

        assert.equal(permissionOverwrites[0].id, "0");
        assert.equal(permissionOverwrites[2].id, "client-moderator");
    });
});
