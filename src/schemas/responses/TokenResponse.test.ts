import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";

describe("TokenResponse schema", () => {
    const schemas = JSON.parse(fs.readFileSync("assets/schemas.json", "utf8"));
    const openapi = JSON.parse(fs.readFileSync("assets/openapi.json", "utf8"));

    test("uses schema-layer response types instead of util entities", () => {
        assert.equal(schemas.TokenResponse.properties.settings.$ref, "#/definitions/UserSettingsSchema");
        assert.ok(schemas.UserSettingsSchema);

        const backupCodes = schemas.TokenWithBackupCodesResponse.properties.backup_codes;
        assert.deepEqual(Object.keys(backupCodes.items.properties), ["id", "code", "consumed"]);
        assert.equal(backupCodes.items.properties.id.type, "string");
        assert.equal(backupCodes.items.properties.code.type, "string");
        assert.equal(backupCodes.items.properties.consumed.type, "boolean");
    });

    test("publishes the same public token response shapes through OpenAPI", () => {
        const components = openapi.components.schemas;

        assert.equal(components.TokenResponse.properties.settings.$ref, "#/components/schemas/UserSettingsSchema");
        assert.ok(components.UserSettingsSchema);

        const backupCodes = components.TokenWithBackupCodesResponse.properties.backup_codes;
        assert.deepEqual(Object.keys(backupCodes.items.properties), ["id", "code", "consumed"]);
        assert.equal(backupCodes.items.properties.id.type, "string");
        assert.equal(backupCodes.items.properties.code.type, "string");
        assert.equal(backupCodes.items.properties.consumed.type, "boolean");
    });
});
