import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { QueryRunner } from "typeorm";
import { webauthn1675044825710 } from "./1675044825710-webauthn";

const createRecordingQueryRunner = () => {
    const queries: string[] = [];
    const queryRunner = {
        query: async (query: string) => {
            queries.push(query);
        },
    } as Partial<QueryRunner> as QueryRunner;

    return { queries, queryRunner };
};

describe("webauthn1675044825710", () => {
    test("reconciles existing webauthn schema objects during up migration", async () => {
        const migration = new webauthn1675044825710();
        const { queries, queryRunner } = createRecordingQueryRunner();

        await migration.up(queryRunner);

        assert.equal(queries.length, 3);
        assert.match(queries[0], /CREATE TABLE IF NOT EXISTS "security_keys"/);
        assert.match(queries[1], /ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webauthn_enabled"/);
        assert.match(queries[2], /IF NOT EXISTS \(/);
        assert.match(queries[2], /FROM pg_constraint/);
        assert.match(queries[2], /conname = 'FK_24c97d0771cafedce6d7163eaad'/);
        assert.match(queries[2], /ALTER TABLE "security_keys" ADD CONSTRAINT "FK_24c97d0771cafedce6d7163eaad"/);
    });

    test("uses idempotent down migration statements", async () => {
        const migration = new webauthn1675044825710();
        const { queries, queryRunner } = createRecordingQueryRunner();

        await migration.down(queryRunner);

        assert.equal(queries.length, 3);
        assert.match(queries[0], /to_regclass\('security_keys'\) IS NOT NULL/);
        assert.match(queries[0], /DROP CONSTRAINT IF EXISTS "FK_24c97d0771cafedce6d7163eaad"/);
        assert.match(queries[1], /DROP COLUMN IF EXISTS "webauthn_enabled"/);
        assert.match(queries[2], /DROP TABLE IF EXISTS "security_keys"/);
    });
});
