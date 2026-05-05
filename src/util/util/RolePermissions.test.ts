import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { resolveCreatedRolePermissions } from "./RolePermissions";

describe("created role permissions", () => {
    test("inherits @everyone permissions when create payload omits permissions", () => {
        assert.equal(resolveCreatedRolePermissions({ everyone: "64", actor: 127n }), "64");
    });

    test("inherits @everyone permissions when clients send zero permissions on create", () => {
        assert.equal(resolveCreatedRolePermissions({ requested: "0", everyone: "64", actor: 127n }), "64");
    });

    test("caps requested permissions to the creator permissions", () => {
        assert.equal(resolveCreatedRolePermissions({ requested: "7", everyone: "64", actor: 5n }), "5");
    });
});
