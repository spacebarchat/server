import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";

describe("EmailDomainLookupVerifyCodeResponse schema", () => {
    test("uses the email-domain guild DTO instead of the Guild entity", () => {
        const schemas = JSON.parse(fs.readFileSync("assets/schemas.json", "utf8"));

        assert.deepEqual(schemas.EmailDomainLookupVerifyCodeResponse.properties.guild.anyOf, [{ $ref: "#/definitions/HubGuild" }, { type: "null" }]);
        assert.deepEqual(Object.keys(schemas.HubGuild.properties), ["icon", "id", "name"]);
    });
});
