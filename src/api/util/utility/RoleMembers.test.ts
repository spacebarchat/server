import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getMissingRoleMemberIds, getRoleMemberIdsToAdd, normalizeRoleMemberPatchIds } from "./RoleMembers";

describe("role member helpers", () => {
    test("deduplicates patch member ids", () => {
        assert.deepEqual(normalizeRoleMemberPatchIds(["2", "1", "2"]), ["2", "1"]);
    });

    test("accepts an empty patch member id list", () => {
        assert.deepEqual(normalizeRoleMemberPatchIds([]), []);
    });

    test("rejects non-string patch member ids", () => {
        assert.throws(() => normalizeRoleMemberPatchIds(["1", 2]), TypeError);
        assert.throws(() => normalizeRoleMemberPatchIds("1"), TypeError);
        assert.throws(() => normalizeRoleMemberPatchIds(undefined), TypeError);
    });

    test("returns only requested members missing the role", () => {
        assert.deepEqual(
            getRoleMemberIdsToAdd(
                [
                    { id: "3", role_ids: [] },
                    { id: "1", role_ids: ["role"] },
                    { id: "2", role_ids: [] },
                ],
                ["1", "2", "3"],
                "role",
            ),
            ["2", "3"],
        );
    });

    test("does not treat omitted existing role members as removals", () => {
        assert.deepEqual(
            getRoleMemberIdsToAdd(
                [
                    { id: "1", role_ids: ["role"] },
                    { id: "2", role_ids: [] },
                    { id: "3", role_ids: ["role"] },
                ],
                [],
                "role",
            ),
            [],
        );
    });

    test("returns requested member ids missing from the guild member query", () => {
        assert.deepEqual(
            getMissingRoleMemberIds(
                [
                    { id: "2", role_ids: [] },
                    { id: "4", role_ids: [] },
                ],
                ["1", "2", "3", "4"],
            ),
            ["1", "3"],
        );
    });
});
