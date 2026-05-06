import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ReactionType } from "@spacebar/util";
import { parseReactionTypeParam } from "./ReactionTypes";

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
});
