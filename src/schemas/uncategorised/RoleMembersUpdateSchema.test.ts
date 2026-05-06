import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ajv, validateSchema } from "../Validator";

describe("RoleMembersUpdateSchema", () => {
    test("accepts a member_ids array", () => {
        assert.deepEqual(validateSchema("RoleMembersUpdateSchema", { member_ids: ["123", "456"] }), { member_ids: ["123", "456"] });
    });

    test("accepts an empty member_ids array for full replacement clears", () => {
        assert.deepEqual(validateSchema("RoleMembersUpdateSchema", { member_ids: [] }), { member_ids: [] });
    });

    test("rejects missing member_ids", () => {
        assert.equal(ajv.validate("RoleMembersUpdateSchema", {}), false);
    });

    test("rejects non-array member_ids", () => {
        assert.equal(ajv.validate("RoleMembersUpdateSchema", { member_ids: "123" }), false);
    });

    test("rejects additional properties", () => {
        assert.equal(ajv.validate("RoleMembersUpdateSchema", { member_ids: ["123"], extra: true }), false);
    });
});
