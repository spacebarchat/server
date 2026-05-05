import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";

describe("AccountStandingResponse schema", () => {
    test("types classification flagged content", () => {
        const schemas = JSON.parse(fs.readFileSync("assets/schemas.json", "utf8"));

        const flaggedContent = schemas.Classification.properties.flagged_content;
        assert.equal(flaggedContent.type, "array");
        assert.equal(flaggedContent.items.$ref, "#/definitions/FlaggedContent");

        assert.deepEqual(Object.keys(schemas.FlaggedContent.properties), ["type", "id", "content", "attachments"]);
        assert.deepEqual(schemas.FlaggedContent.properties.type.const, "message");
        assert.equal(schemas.FlaggedContent.properties.attachments.items.$ref, "#/definitions/PublicAttachment");
    });
});
