import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ReactionType } from "@spacebar/util";
import { PartialEmoji, StoredReaction } from "@spacebar/schemas";
import {
    addReactionUser,
    getReactionUserIds,
    normalizeStoredReaction,
    parseOptionalReactionTypeParam,
    parseReactionTypeParam,
    reactionEventTypeData,
    reactionRemoveEventUserData,
    removeReactionUser,
    toPublicReaction,
    toPublicReactions,
} from "./ReactionTypes";

describe("parseReactionTypeParam", () => {
    it("parses normal and burst reaction types", () => {
        assert.equal(parseReactionTypeParam("0"), ReactionType.normal);
        assert.equal(parseReactionTypeParam("1"), ReactionType.burst);
    });

    it("rejects unsupported route values", () => {
        assert.equal(parseReactionTypeParam("2"), null);
        assert.equal(parseReactionTypeParam("normal"), null);
        assert.equal(parseReactionTypeParam(""), null);
    });

    it("defaults missing optional route values to normal reactions", () => {
        assert.equal(parseOptionalReactionTypeParam(undefined), ReactionType.normal);
        assert.equal(parseOptionalReactionTypeParam("1"), ReactionType.burst);
        assert.equal(parseOptionalReactionTypeParam(["1"]), null);
    });

    it("tracks normal and burst reaction users independently for the same emoji", () => {
        const reactions: StoredReaction[] = [];
        const emoji: PartialEmoji = { name: "🔥" };

        assert.deepEqual(addReactionUser(reactions, emoji, "user-a", ReactionType.normal), {
            reaction: reactions[0],
            created: true,
            changed: true,
        });
        assert.deepEqual(addReactionUser(reactions, emoji, "user-a", ReactionType.normal), {
            reaction: reactions[0],
            created: false,
            changed: false,
        });
        assert.deepEqual(addReactionUser(reactions, emoji, "user-a", ReactionType.burst), {
            reaction: reactions[0],
            created: false,
            changed: true,
        });

        assert.equal(reactions.length, 1);
        assert.equal(reactions[0].count, 2);
        assert.deepEqual(reactions[0].count_details, { normal: 1, burst: 1 });
        assert.deepEqual(getReactionUserIds(reactions[0], ReactionType.normal), ["user-a"]);
        assert.deepEqual(getReactionUserIds(reactions[0], ReactionType.burst), ["user-a"]);
    });

    it("removes only the selected reaction type", () => {
        const reaction = normalizeStoredReaction({
            count: 2,
            count_details: { normal: 1, burst: 1 },
            emoji: { name: "🔥" },
            user_ids: ["user-a"],
            burst_user_ids: ["user-a"],
            burst_colors: [],
        });

        assert.equal(removeReactionUser(reaction, "user-a", ReactionType.burst), true);
        assert.equal(removeReactionUser(reaction, "user-a", ReactionType.burst), false);
        assert.equal(reaction.count, 1);
        assert.deepEqual(reaction.count_details, { normal: 1, burst: 0 });
        assert.deepEqual(getReactionUserIds(reaction, ReactionType.normal), ["user-a"]);
        assert.deepEqual(getReactionUserIds(reaction, ReactionType.burst), []);
    });

    it("normalizes legacy stored reactions as normal reactions", () => {
        const reaction = normalizeStoredReaction({
            count: 2,
            emoji: { name: "✅" },
            user_ids: ["user-a", "user-b", "user-a"],
        });

        assert.equal(reaction.count, 2);
        assert.deepEqual(reaction.count_details, { normal: 2, burst: 0 });
        assert.deepEqual(reaction.user_ids, ["user-a", "user-b"]);
        assert.deepEqual(reaction.burst_user_ids, []);
        assert.deepEqual(reaction.burst_colors, []);
    });

    it("serializes public reaction state without internal user id arrays", () => {
        const publicReaction = toPublicReaction(
            {
                count: 2,
                emoji: { name: "🔥" },
                user_ids: ["normal-user"],
                burst_user_ids: ["burst-user"],
                burst_colors: ["#ff0000"],
            },
            "burst-user",
        );

        assert.deepEqual(publicReaction, {
            count: 2,
            count_details: { normal: 1, burst: 1 },
            me: false,
            me_burst: true,
            emoji: { name: "🔥" },
            burst_colors: ["#ff0000"],
        });
        assert.equal("user_ids" in publicReaction, false);
        assert.equal("burst_user_ids" in publicReaction, false);
    });

    it("serializes absent public reactions as an empty array", () => {
        assert.deepEqual(toPublicReactions(undefined, "user-a"), []);
    });

    it("builds Discord-compatible event type flags", () => {
        assert.deepEqual(reactionEventTypeData(ReactionType.normal), {
            type: ReactionType.normal,
            burst: false,
        });
        assert.deepEqual(reactionEventTypeData(ReactionType.burst), {
            type: ReactionType.burst,
            burst: true,
        });
    });

    it("uses the removed reaction owner in remove event data", () => {
        assert.deepEqual(reactionRemoveEventUserData("target-user", ReactionType.burst), {
            user_id: "target-user",
            type: ReactionType.burst,
            burst: true,
        });
    });

    it("declares typed reaction mutation routes", () => {
        const routePath = path.resolve(process.cwd(), "src/api/routes/channels/#channel_id/messages/#message_id/reactions.ts");
        const source = fs.readFileSync(routePath, "utf8");

        assert.match(source, /router\.put\(\s*"\/:emoji\/:user_id"/);
        assert.match(source, /router\.put\(\s*"\/:emoji\/:type\/:user_id"/);
        assert.match(source, /router\.delete\(\s*"\/:emoji\/:user_id"/);
        assert.match(source, /router\.delete\(\s*"\/:emoji\/:type\/:user_id"/);
    });
});
