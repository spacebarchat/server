import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";

describe("TokenResponse schema", () => {
    test("uses schema-layer response types instead of util entities", () => {
        const schemas = JSON.parse(fs.readFileSync("assets/schemas.json", "utf8"));

        assert.equal(schemas.TokenResponse.properties.settings.$ref, "#/definitions/UserSettingsSchema");
        assert.ok(schemas.UserSettingsSchema);

        const backupCodes = schemas.TokenWithBackupCodesResponse.properties.backup_codes;
        assert.deepEqual(Object.keys(backupCodes.items.properties), ["id", "code", "consumed"]);
        assert.equal(backupCodes.items.properties.id.type, "string");
        assert.equal(backupCodes.items.properties.code.type, "string");
        assert.equal(backupCodes.items.properties.consumed.type, "boolean");
    });
});
