import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { generateSecret, generateToken } from "node-2fa";
import { HTTPError } from "lambert-server";
import { User } from "@spacebar/util";
import { requireTotpCodeIfConfigured, requireValidTotpCodeIfConfigured } from "./Totp";

const originalFindOneOrFail = User.findOneOrFail;

describe("requireTotpCodeIfConfigured", () => {
    afterEach(() => {
        User.findOneOrFail = originalFindOneOrFail;
    });

    test("loads the hidden TOTP secret explicitly", async () => {
        User.findOneOrFail = ((options: unknown) => {
            assert.deepEqual(options, {
                where: { id: "user_id" },
                select: { id: true, totp_secret: true },
            });
            return Promise.resolve({ id: "user_id", totp_secret: "" });
        }) as typeof User.findOneOrFail;

        await requireTotpCodeIfConfigured("user_id", undefined, "Invalid code");
    });

    test("does not require a code when no TOTP secret is configured", async () => {
        User.findOneOrFail = (() => Promise.resolve({ id: "user_id", totp_secret: "" })) as typeof User.findOneOrFail;

        await requireTotpCodeIfConfigured("user_id", undefined, "Invalid code");
    });

    test("rejects missing and invalid codes when TOTP is configured", async () => {
        const secret = generateSecret({ name: "Spacebar", account: "totp@example.test" }).secret;
        User.findOneOrFail = (() => Promise.resolve({ id: "user_id", totp_secret: secret })) as typeof User.findOneOrFail;

        await assert.rejects(
            () => requireTotpCodeIfConfigured("user_id", undefined, "Invalid code"),
            (error) => {
                assert.ok(error instanceof HTTPError);
                assert.equal(error.message, "Invalid code");
                assert.equal(error.code, 60008);
                return true;
            },
        );

        await assert.rejects(() => requireTotpCodeIfConfigured("user_id", "000000", "Invalid code"), HTTPError);
    });

    test("accepts a valid current TOTP code", async () => {
        const secret = generateSecret({ name: "Spacebar", account: "totp@example.test" }).secret;
        const generated = generateToken(secret);
        assert.ok(generated);

        User.findOneOrFail = (() => Promise.resolve({ id: "user_id", totp_secret: secret })) as typeof User.findOneOrFail;

        await requireTotpCodeIfConfigured("user_id", generated.token, "Invalid code");
    });
});

describe("requireValidTotpCodeIfConfigured", () => {
    test("can validate an already-selected TOTP secret without a database lookup", () => {
        const secret = generateSecret({ name: "Spacebar", account: "totp@example.test" }).secret;
        const generated = generateToken(secret);
        assert.ok(generated);

        assert.doesNotThrow(() => requireValidTotpCodeIfConfigured("", undefined, "Invalid code"));
        assert.doesNotThrow(() => requireValidTotpCodeIfConfigured(secret, generated.token, "Invalid code"));
        assert.throws(() => requireValidTotpCodeIfConfigured(secret, "000000", "Invalid code"), HTTPError);
    });
});
