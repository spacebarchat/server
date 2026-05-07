import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ajv } from "./Validator";

function getSchema(name: string) {
    const validate = ajv.getSchema(name);
    assert.ok(validate, `${name} should be registered`);
    return validate;
}

describe("application MFA request schemas", () => {
    test("keeps MFA code out of the base application modify schema", () => {
        const validate = getSchema("ApplicationModifySchema");

        assert.equal(validate({ name: "Example App" }), true);
        assert.equal(validate({ code: "123456" }), false);
        assert.equal(validate.errors?.[0]?.keyword, "additionalProperties");
    });

    test("allows MFA code only on owner application modify requests", () => {
        const validate = getSchema("ApplicationOwnerModifySchema");

        assert.equal(validate({ name: "Example App", code: "123456" }), true);
    });

    test("allows optional MFA code bodies for MFA-protected actions", () => {
        const validate = getSchema("MfaCodeSchema");

        assert.equal(validate({}), true);
        assert.equal(validate({ code: "123456" }), true);
        assert.equal(validate({ code: "123456", name: "not allowed here" }), false);
        assert.equal(validate(undefined), false);
    });
});
