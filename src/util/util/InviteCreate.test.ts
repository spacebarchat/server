import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { buildInviteReuseCriteria, DEFAULT_INVITE_MAX_AGE, findReusableInviteCandidate, normalizeInviteCreateOptions, shouldReuseInviteForCreate } from "./InviteCreate";

function makeReusableInvite(options: { code: string; expired?: boolean }) {
    return {
        code: options.code,
        isExpired() {
            return options.expired ?? false;
        },
    };
}

describe("Invite create helpers", () => {
    test("normalizes Discord invite create defaults", () => {
        const now = new Date("2026-01-01T00:00:00.000Z");
        const options = normalizeInviteCreateOptions({}, now);

        assert.equal(options.max_age, DEFAULT_INVITE_MAX_AGE);
        assert.equal(options.max_uses, 0);
        assert.equal(options.temporary, false);
        assert.equal(options.unique, false);
        assert.equal(options.flags, 0);
        assert.equal(options.created_at, now);
        assert.equal(options.expires_at?.getTime(), now.getTime() + DEFAULT_INVITE_MAX_AGE * 1000);
        assert.equal(shouldReuseInviteForCreate(options), true);
    });

    test("honors explicit create options before persistence", () => {
        const now = new Date("2026-01-01T00:00:00.000Z");
        const options = normalizeInviteCreateOptions(
            {
                max_age: 0,
                max_uses: 2,
                temporary: false,
                unique: true,
                flags: 4,
                target_user_id: "target-user",
                target_type: "1",
            },
            now,
        );

        assert.equal(options.max_age, 0);
        assert.equal(options.max_uses, 2);
        assert.equal(options.temporary, false);
        assert.equal(options.unique, true);
        assert.equal(options.flags, 4);
        assert.equal(options.expires_at, undefined);
        assert.equal(options.target_user_id, "target-user");
        assert.equal(options.target_user_type, 1);
        assert.equal(shouldReuseInviteForCreate(options), false);
    });

    test("builds reuse criteria from normalized invite properties", () => {
        const options = normalizeInviteCreateOptions({
            max_age: 120,
            max_uses: 3,
            temporary: true,
            flags: 8,
            target_user_id: "target-user",
            target_user_type: 1,
        });
        const criteria = buildInviteReuseCriteria(
            {
                guild_id: "guild",
                channel_id: "channel",
                inviter_id: "inviter",
            },
            options,
        ) as Record<string, unknown>;

        assert.equal(criteria.guild_id, "guild");
        assert.equal(criteria.channel_id, "channel");
        assert.equal(criteria.inviter_id, "inviter");
        assert.equal(criteria.max_age, 120);
        assert.equal(criteria.max_uses, 3);
        assert.equal(criteria.temporary, true);
        assert.equal(criteria.flags, 8);
        assert.equal(criteria.target_user_id, "target-user");
        assert.equal(criteria.target_user_type, 1);
    });

    test("selects the first active reusable invite", () => {
        const expired = makeReusableInvite({ code: "expired", expired: true });
        const active = makeReusableInvite({ code: "active" });

        assert.equal(findReusableInviteCandidate([expired, active])?.code, "active");
    });
});
