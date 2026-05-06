import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { calculateRoleMemberAdditions, calculateRoleMemberReplacement } from "./RoleMembers";

describe("role member update helpers", () => {
    const roleId = "role";
    const otherRoleId = "other";
    const members = [
        { id: "already-desired", roles: [{ id: roleId }] },
        { id: "needs-add", roles: [{ id: otherRoleId }] },
        { id: "needs-remove", roles: [{ id: roleId }, { id: otherRoleId }] },
        { id: "unrelated", roles: [] },
    ];

    test("PATCH additions add missing desired members without removing omitted current holders", () => {
        const changes = calculateRoleMemberAdditions(members, ["already-desired", "needs-add"], roleId);

        assert.deepEqual(changes, {
            addMemberIds: ["needs-add"],
            removeMemberIds: [],
        });
    });

    test("PATCH additions keep existing holders that were omitted", () => {
        const changes = calculateRoleMemberAdditions(members, ["needs-add"], roleId);

        assert.deepEqual(changes, {
            addMemberIds: ["needs-add"],
            removeMemberIds: [],
        });
    });

    test("PUT replacement adds missing desired members and removes omitted current holders", () => {
        const changes = calculateRoleMemberReplacement(members, ["already-desired", "needs-add"], roleId);

        assert.deepEqual(changes, {
            addMemberIds: ["needs-add"],
            removeMemberIds: ["needs-remove"],
        });
    });

    test("PUT replacement keeps desired current holders and unrelated non-holders unchanged", () => {
        const changes = calculateRoleMemberReplacement(members, ["already-desired"], roleId);

        assert.equal(changes.addMemberIds.includes("already-desired"), false);
        assert.equal(changes.removeMemberIds.includes("already-desired"), false);
        assert.equal(changes.removeMemberIds.includes("unrelated"), false);
    });

    test("deduplicates desired member ids through set semantics", () => {
        const changes = calculateRoleMemberReplacement(members, ["needs-add", "needs-add"], roleId);

        assert.deepEqual(changes.addMemberIds, ["needs-add"]);
    });

    test("empty PUT replacement desired list removes only current role holders", () => {
        const changes = calculateRoleMemberReplacement(members, [], roleId);

        assert.deepEqual(changes, {
            addMemberIds: [],
            removeMemberIds: ["already-desired", "needs-remove"],
        });
    });
});
