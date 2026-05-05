import { describe, mock, test } from "node:test";
import assert from "node:assert/strict";
import { generateSecret, generateToken } from "node-2fa";
import { isValidTotpCode } from "./Totp";

describe("TOTP verification", () => {
    test("accepts the current token for the secret", () => {
        const secret = generateSecret({ name: "Spacebar", account: "totp@example.test" }).secret;
        const generated = generateToken(secret);
        assert.ok(generated);

        assert.equal(isValidTotpCode(secret, generated.token), true);
    });

    test("rejects missing, non-string, and incorrect codes", () => {
        const secret = generateSecret({ name: "Spacebar", account: "totp@example.test" }).secret;

        assert.equal(isValidTotpCode(secret, "000000"), false);
        assert.equal(isValidTotpCode(secret, undefined), false);
        assert.equal(isValidTotpCode(secret, 123456), false);
        assert.equal(isValidTotpCode(undefined, "000000"), false);
        assert.equal(isValidTotpCode("", "000000"), false);
    });

    test("rejects a valid token from an adjacent time window", () => {
        const secret = generateSecret({ name: "Spacebar", account: "totp@example.test" }).secret;
        const generated = generateToken(secret);
        assert.ok(generated);

        mock.timers.enable({ apis: ["Date"], now: Date.now() + 30_000 });
        try {
            assert.equal(isValidTotpCode(secret, generated.token), false);
        } finally {
            mock.timers.reset();
        }
    });
});
