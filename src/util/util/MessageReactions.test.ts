import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { isOwnReactionTarget, resolveReactionTargetUserId } from "./MessageReactions";

describe("Message reaction helpers", () => {
    test("resolves @me to the requesting user", () => {
        assert.equal(resolveReactionTargetUserId("@me", "request_user"), "request_user");
        assert.equal(isOwnReactionTarget("@me"), true);
    });

    test("keeps explicit target user ids for moderation routes", () => {
        assert.equal(resolveReactionTargetUserId("target_user", "request_user"), "target_user");
        assert.equal(isOwnReactionTarget("target_user"), false);
    });
});
