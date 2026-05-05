import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { profilePronouns } from "./UserProfile";

describe("profilePronouns", () => {
    test("serializes absent pronouns as an empty string", () => {
        assert.equal(profilePronouns(null), "");
        assert.equal(profilePronouns(undefined), "");
    });

    test("preserves explicit pronouns", () => {
        assert.equal(profilePronouns("they/them"), "they/them");
        assert.equal(profilePronouns(""), "");
    });
});
