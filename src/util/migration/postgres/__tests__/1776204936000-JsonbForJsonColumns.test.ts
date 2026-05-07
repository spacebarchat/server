import { describe, test } from "node:test";
import assert from "node:assert";
import { QueryRunner } from "typeorm";
import { JsonbForJsonColumns1776204936000 } from "../1776204936000-JsonbForJsonColumns";

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

describe("JsonbForJsonColumns1776204936000", () => {
    test("safely converts legacy category localization text to jsonb objects", async () => {
        const migration = new JsonbForJsonColumns1776204936000();
        const { queries, queryRunner } = createQueryRunner();

        await migration.up(queryRunner);

        const functionIndex = queries.findIndex((query) => query.includes("CREATE OR REPLACE FUNCTION pg_temp.safe_jsonb_object_from_text"));
        const categoriesIndex = queries.findIndex((query) => query.includes("ALTER TABLE categories ALTER COLUMN localizations TYPE jsonb"));

        assert.notStrictEqual(functionIndex, -1);
        assert.notStrictEqual(categoriesIndex, -1);
        assert.ok(functionIndex < categoriesIndex);
        const conversionFunction = queries[functionIndex];
        assert.match(conversionFunction, /IF input_value IS NULL OR btrim\(input_value\) = '' THEN\s+RETURN '\{\}'::jsonb;/);
        assert.match(conversionFunction, /parsed := input_value::jsonb;\s+IF jsonb_typeof\(parsed\) = 'object' THEN\s+RETURN parsed;/);
        assert.match(conversionFunction, /RETURN '\{\}'::jsonb;\s+EXCEPTION WHEN others THEN\s+RETURN '\{\}'::jsonb;/);
        assert.strictEqual(
            queries[categoriesIndex],
            `ALTER TABLE categories ALTER COLUMN localizations TYPE jsonb USING pg_temp.safe_jsonb_object_from_text(localizations::text);`,
        );
        assert.strictEqual(
            queries.some((query) => query === `ALTER TABLE categories ALTER COLUMN localizations TYPE jsonb USING localizations::jsonb;`),
            false,
        );
    });

    test("keeps the reversible varchar cast when rolling back", async () => {
        const migration = new JsonbForJsonColumns1776204936000();
        const { queries, queryRunner } = createQueryRunner();

        await migration.down(queryRunner);

        assert.strictEqual(
            queries.some((query) => query.includes("safe_jsonb_object_from_text")),
            false,
        );
        assert.ok(queries.includes(`ALTER TABLE categories ALTER COLUMN localizations TYPE varchar USING localizations::varchar;`));
    });
});
