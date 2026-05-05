import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Role } from "../entities";
import { Permissions } from "./Permissions";

const CHANNEL_PERMISSION_OVERWRITE_ROLE = 0;

describe("Permissions", () => {
    test("channel overwrites cannot deny administrator permissions", () => {
        const permissions = new Permissions(
            Permissions.channelPermission(
                [
                    {
                        id: "role_id",
                        type: CHANNEL_PERMISSION_OVERWRITE_ROLE,
                        allow: "0",
                        deny: (Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.SEND_MESSAGES | Permissions.FLAGS.ADMINISTRATOR).toString(),
                    },
                ],
                Permissions.FLAGS.ADMINISTRATOR,
            ),
        );

        assert.equal(permissions.has("ADMINISTRATOR", false), true);
        assert.equal(permissions.has("VIEW_CHANNEL", false), true);
        assert.equal(permissions.has("SEND_MESSAGES", false), true);
    });

    test("channel overwrites still deny non-administrator permissions", () => {
        const permissions = new Permissions(
            Permissions.channelPermission(
                [
                    {
                        id: "role_id",
                        type: CHANNEL_PERMISSION_OVERWRITE_ROLE,
                        allow: "0",
                        deny: Permissions.FLAGS.SEND_MESSAGES.toString(),
                    },
                ],
                Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.SEND_MESSAGES,
            ),
        );

        assert.equal(permissions.has("VIEW_CHANNEL", false), true);
        assert.equal(permissions.has("SEND_MESSAGES", false), false);
    });

    test("final guild permissions preserve administrator through channel overwrites", () => {
        const permissions = Permissions.finalPermission({
            user: {
                id: "user_id",
                roles: ["admin_role"],
                communication_disabled_until: null,
                flags: 0,
            },
            guild: {
                id: "guild_id",
                owner_id: "owner_id",
                roles: [
                    {
                        id: "admin_role",
                        permissions: Permissions.FLAGS.ADMINISTRATOR.toString(),
                    } as Role,
                ],
            },
            channel: {
                overwrites: [
                    {
                        id: "admin_role",
                        type: CHANNEL_PERMISSION_OVERWRITE_ROLE,
                        allow: "0",
                        deny: (Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.SEND_MESSAGES | Permissions.FLAGS.ADMINISTRATOR).toString(),
                    },
                ],
            },
        });

        assert.equal(permissions.has("ADMINISTRATOR", false), true);
        assert.equal(permissions.has("VIEW_CHANNEL", false), true);
        assert.equal(permissions.has("SEND_MESSAGES", false), true);
    });

    test("overwriteChannel preserves administrator permissions", () => {
        const permissions = new Permissions("ADMINISTRATOR");
        permissions.cache = { roles: [{ id: "role_id" } as Role] };

        const overwritten = permissions.overwriteChannel([
            {
                id: "role_id",
                type: CHANNEL_PERMISSION_OVERWRITE_ROLE,
                allow: "0",
                deny: (Permissions.FLAGS.VIEW_CHANNEL | Permissions.FLAGS.SEND_MESSAGES | Permissions.FLAGS.ADMINISTRATOR).toString(),
            },
        ]);

        assert.equal(overwritten.has("ADMINISTRATOR", false), true);
        assert.equal(overwritten.has("VIEW_CHANNEL", false), true);
        assert.equal(overwritten.has("SEND_MESSAGES", false), true);
    });
});
