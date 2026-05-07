import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ajv } from "../Validator";

describe("UserModifySchema", () => {
    const validate = ajv.getSchema("UserModifySchema");

    test("allows null email so optional email can be cleared", () => {
        assert.ok(validate);
        assert.equal(validate!({ email: null, password: "hunter2" }), true);
    });

    test("still validates non-null email format", () => {
        assert.ok(validate);
        assert.equal(validate!({ email: "user@example.com", password: "hunter2" }), true);
        assert.equal(validate!({ email: "not an email", password: "hunter2" }), false);
    });
});
