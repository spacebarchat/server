import { describe, test } from "node:test";
import assert from "node:assert";
import { QueryRunner } from "typeorm";
import { CategoryLocalizationsDefault1776400000000 } from "../1776400000000-CategoryLocalizationsDefault";

function createQueryRunner() {
    const queries: string[] = [];
    const queryRunner = {
        query(sql: string) {
            queries.push(sql);
            return Promise.resolve();
        },
    } as unknown as QueryRunner;

    return { queries, queryRunner };
}

describe("CategoryLocalizationsDefault1776400000000", () => {
    test("normalizes and defaults category localizations", async () => {
        const migration = new CategoryLocalizationsDefault1776400000000();
        const { queries, queryRunner } = createQueryRunner();

        await migration.up(queryRunner);

        assert.deepStrictEqual(queries, [
            `UPDATE categories SET localizations = '{}'::jsonb WHERE localizations IS NULL OR jsonb_typeof(localizations) <> 'object';`,
            `ALTER TABLE categories ALTER COLUMN localizations SET DEFAULT '{}'::jsonb;`,
            `ALTER TABLE categories ALTER COLUMN localizations SET NOT NULL;`,
            `ALTER TABLE categories DROP CONSTRAINT IF EXISTS "CHK_categories_localizations_object";`,
            `ALTER TABLE categories ADD CONSTRAINT "CHK_categories_localizations_object" CHECK (jsonb_typeof(localizations) = 'object');`,
        ]);
    });

    test("drops the constraint and default on rollback", async () => {
        const migration = new CategoryLocalizationsDefault1776400000000();
        const { queries, queryRunner } = createQueryRunner();

        await migration.down(queryRunner);

        assert.deepStrictEqual(queries, [
            `ALTER TABLE categories DROP CONSTRAINT IF EXISTS "CHK_categories_localizations_object";`,
            `ALTER TABLE categories ALTER COLUMN localizations DROP DEFAULT;`,
        ]);
    });
});
