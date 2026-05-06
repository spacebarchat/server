import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { QueryRunner } from "typeorm";
import * as normalizeUserEmailsMigration from "../migration/postgres/1777999500000-NormalizeUserEmails";
import {
    emailAlreadyRegisteredFieldError,
    isNormalizedEmailUniqueViolation,
    normalizeEmail,
    normalizeOptionalEmail,
    normalizedEmailSqlExpression,
    POSTGRES_JS_TRIM_WHITESPACE,
    USERS_EMAIL_NORMALIZED_INDEX,
} from "./EmailAddress";

const { NormalizeUserEmails1777999500000 } = normalizeUserEmailsMigration;

const jsTrimWhitespaceCodePoints = [
    0x0009, 0x000a, 0x000b, 0x000c, 0x000d, 0x0020, 0x00a0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f,
    0x205f, 0x3000, 0xfeff,
];

function createQueryRunner(responses: unknown[] = []) {
    const queries: string[] = [];

    return {
        queries,
        queryRunner: {
            query: async (query: string) => {
                queries.push(query);
                return responses.shift() ?? [];
            },
        } as unknown as QueryRunner,
    };
}

describe("email address utilities", () => {
    test("normalizes email case and surrounding whitespace", () => {
        assert.equal(normalizeEmail(" User.Name+Tag@Example.COM "), "user.name+tag@example.com");

        for (const codePoint of jsTrimWhitespaceCodePoints) {
            const whitespace = String.fromCodePoint(codePoint);
            assert.equal(normalizeEmail(`${whitespace}User.Name+Tag@Example.COM${whitespace}`), "user.name+tag@example.com", codePoint.toString(16));
        }
    });

    test("keeps non-JavaScript-trim characters as part of the normalized address", () => {
        assert.equal(normalizeEmail("\u180eUser.Name+Tag@Example.COM\u180e"), "\u180euser.name+tag@example.com\u180e");
    });

    test("normalizes optional email fields without storing blank emails", () => {
        assert.equal(normalizeOptionalEmail(undefined), undefined);
        assert.equal(normalizeOptionalEmail(null), undefined);
        assert.equal(normalizeOptionalEmail(" \t\r\n"), undefined);
        assert.equal(normalizeOptionalEmail(" MixedCase@Example.COM "), "mixedcase@example.com");
    });

    test("builds the normalized Postgres email expression using JavaScript trim whitespace", () => {
        assert.equal(normalizedEmailSqlExpression("users.email"), `LOWER(BTRIM(users.email, ${POSTGRES_JS_TRIM_WHITESPACE}))`);
        assert.match(POSTGRES_JS_TRIM_WHITESPACE, /\\0009/);
        assert.match(POSTGRES_JS_TRIM_WHITESPACE, /\\FEFF/);
    });

    test("exports only the migration class from the email migration module", () => {
        assert.deepEqual(Object.keys(normalizeUserEmailsMigration).sort(), ["NormalizeUserEmails1777999500000"]);
    });

    test("uses the shared normalized Postgres expression in the email migration", async () => {
        const migration = new NormalizeUserEmails1777999500000();
        const { queries, queryRunner } = createQueryRunner();
        const expression = normalizedEmailSqlExpression("email");

        await migration.up(queryRunner);

        assert.equal(queries.length, 4);
        assert.ok(queries[0].includes(`SELECT ${expression} AS normalized_email`));
        assert.ok(queries[0].includes(`WHERE email IS NOT NULL AND ${expression} <> ''`));
        assert.ok(queries[0].includes(`GROUP BY ${expression}`));
        assert.equal(queries[1], `UPDATE users SET email = NULL WHERE email IS NOT NULL AND ${expression} = '';`);
        assert.equal(queries[2], `UPDATE users SET email = ${expression} WHERE email IS NOT NULL;`);
        assert.equal(queries[3], `CREATE UNIQUE INDEX ${USERS_EMAIL_NORMALIZED_INDEX} ON users (${expression}) WHERE email IS NOT NULL;`);
        assert.equal(
            queries.some((query) => query.includes("LOWER(TRIM")),
            false,
        );
    });

    test("aborts the email migration when normalized duplicates exist", async () => {
        const migration = new NormalizeUserEmails1777999500000();
        const { queries, queryRunner } = createQueryRunner([[{ normalized_email: "foo@example.com", ids: ["1", "2"] }]]);

        await assert.rejects(() => migration.up(queryRunner), /foo@example.com: 1, 2/);
        assert.equal(queries.length, 1);
    });

    test("detects normalized-email unique constraint violations", () => {
        assert.equal(isNormalizedEmailUniqueViolation({ code: "23505", constraint: USERS_EMAIL_NORMALIZED_INDEX }), true);
        assert.equal(isNormalizedEmailUniqueViolation({ driverError: { code: "23505", constraint: USERS_EMAIL_NORMALIZED_INDEX } }), true);
        assert.equal(isNormalizedEmailUniqueViolation({ code: "23505", constraint: "other_unique_index" }), false);
        assert.equal(isNormalizedEmailUniqueViolation({ code: "23503", constraint: USERS_EMAIL_NORMALIZED_INDEX }), false);
    });

    test("builds the shared duplicate-email field error", () => {
        const error = emailAlreadyRegisteredFieldError("Already used");

        assert.equal(error.code, 50035);
        assert.equal(error.errors?.email._errors[0].code, "EMAIL_ALREADY_REGISTERED");
        assert.equal(error.errors?.email._errors[0].message, "Already used");
    });
});
