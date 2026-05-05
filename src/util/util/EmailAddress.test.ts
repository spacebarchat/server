import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { emailMatches, normalizeEmail } from "./EmailAddress";

describe("email address utilities", () => {
    test("normalizes email case and surrounding whitespace", () => {
        assert.equal(normalizeEmail(" User.Name+Tag@Example.COM "), "user.name+tag@example.com");
    });

    test("builds a normalized case-insensitive TypeORM email match", () => {
        const matcher = emailMatches(" MixedCase@Example.COM ") as unknown as {
            _type: string;
            _objectLiteralParameters: { email: string };
            _getSql: (alias: string) => string;
        };

        assert.equal(matcher._type, "raw");
        assert.equal(matcher._objectLiteralParameters.email, "mixedcase@example.com");
        assert.equal(matcher._getSql("users.email"), "LOWER(TRIM(users.email)) = :email");
    });
});
