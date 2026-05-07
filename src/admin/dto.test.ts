import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { User } from "@spacebar/util";
import { toAdminUser, toAdminUserListItem } from "./dto";

process.env.DATABASE ??= "postgres://user:password@localhost:5432/test";

describe("admin DTOs", () => {
    test("user list DTO excludes detail-only and raw sensitive fields", () => {
        const dto = toAdminUserListItem({
            id: "1",
            username: "admin",
            discriminator: "0001",
            avatar: null,
            accent_color: null,
            banner: null,
            pronouns: null,
            premium: false,
            premium_type: 0,
            bot: false,
            system: false,
            created_at: new Date(0),
            premium_since: null,
            disabled: false,
            deleted: false,
            flags: "0",
            public_flags: "0",
            rights: "1",
            email: "operator@example.com",
            phone: "+15555550100",
            data: { hash: "secret" },
        } as unknown as User);

        assert.equal("email" in dto, false);
        assert.equal("phone" in dto, false);
        assert.equal("data" in dto, false);
        assert.equal("hash" in dto, false);
    });

    test("user detail DTO keeps private fields explicit without raw auth data", () => {
        const dto = toAdminUser(
            {
                id: "1",
                username: "admin",
                discriminator: "0001",
                avatar: null,
                accent_color: null,
                banner: null,
                pronouns: null,
                premium: false,
                premium_type: 0,
                bot: false,
                system: false,
                created_at: new Date(0),
                premium_since: null,
                disabled: false,
                deleted: false,
                flags: "0",
                public_flags: "0",
                rights: "1",
                theme_colors: [],
                phone: "+15555550100",
                desktop: true,
                mobile: false,
                bio: "operator",
                nsfw_allowed: false,
                mfa_enabled: true,
                webauthn_enabled: false,
                verified: true,
                email: "operator@example.com",
                purchased_flags: "0",
                premium_usage_flags: 0,
                data: { hash: "secret" },
            } as unknown as User,
            {
                guildCount: 0,
                ownedGuildCount: 0,
                sessionCount: 0,
                templateCount: 0,
                voiceStateCount: 0,
                messageCount: 0,
            },
        );

        assert.equal(dto.email, "operator@example.com");
        assert.equal(dto.phone, "+15555550100");
        assert.equal("data" in dto, false);
        assert.equal("hash" in dto, false);
    });
});
