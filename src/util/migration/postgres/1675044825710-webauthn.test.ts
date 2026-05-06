import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { QueryRunner } from "typeorm";
import { webauthn1675044825710 } from "./1675044825710-webauthn";

const SECURITY_KEYS_FK = "FK_24c97d0771cafedce6d7163eaad";
const SECURITY_KEYS_PK = "PK_6e95cdd91779e7cca06d1fff89c";

type ColumnType = "bigint" | "boolean" | "character varying" | "integer";

type TableSchema = {
    columns: Record<string, ColumnType>;
    constraints: Set<string>;
};

type FakeSchema = {
    users: TableSchema;
    securityKeys?: TableSchema;
};

const createRecordingQueryRunner = () => {
    const queries: string[] = [];
    const queryRunner = {
        query: async (query: string) => {
            queries.push(query);
        },
    } as Partial<QueryRunner> as QueryRunner;

    return { queries, queryRunner };
};

const createSecurityKeysTable = (idType: ColumnType, userIdType: ColumnType, hasForeignKey = false): TableSchema => ({
    columns: {
        id: idType,
        user_id: userIdType,
        key_id: "character varying",
        public_key: "character varying",
        counter: "integer",
        name: "character varying",
    },
    constraints: new Set([SECURITY_KEYS_PK, ...(hasForeignKey ? [SECURITY_KEYS_FK] : [])]),
});

const getSecurityKeys = (schema: FakeSchema): TableSchema => {
    if (!schema.securityKeys) throw new Error("security_keys table was not created");
    return schema.securityKeys;
};

const createSchemaQueryRunner = (usersIdType: ColumnType, securityKeys?: { idType: ColumnType; userIdType: ColumnType; hasForeignKey?: boolean }) => {
    const queries: string[] = [];
    const schema: FakeSchema = {
        users: {
            columns: {
                id: usersIdType,
            },
            constraints: new Set(["PK_users_id"]),
        },
        securityKeys: securityKeys ? createSecurityKeysTable(securityKeys.idType, securityKeys.userIdType, securityKeys.hasForeignKey) : undefined,
    };

    const queryRunner = {
        query: async (query: string) => {
            queries.push(query);
            executeSchemaQuery(schema, query);
        },
    } as Partial<QueryRunner> as QueryRunner;

    return { queries, queryRunner, schema };
};

const executeSchemaQuery = (schema: FakeSchema, query: string) => {
    if (query.includes(`CREATE TABLE "security_keys"`) && !schema.securityKeys) {
        const createdIdType = query.includes("users_id_type") ? schema.users.columns.id : "character varying";
        schema.securityKeys = createSecurityKeysTable(createdIdType, createdIdType);
    }

    if (query.includes(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webauthn_enabled"`)) {
        schema.users.columns.webauthn_enabled = "boolean";
    }

    const securityKeys = schema.securityKeys;
    if (!securityKeys) return;

    if (query.includes(`DROP CONSTRAINT IF EXISTS "${SECURITY_KEYS_FK}"`)) {
        securityKeys.constraints.delete(SECURITY_KEYS_FK);
    }

    if (query.includes(`ADD COLUMN "id" %s`) && !securityKeys.columns.id) {
        securityKeys.columns.id = schema.users.columns.id;
    }

    if (query.includes(`ADD COLUMN "user_id" %s`) && !securityKeys.columns.user_id) {
        securityKeys.columns.user_id = schema.users.columns.id;
    }

    if (query.includes(`ALTER COLUMN "id" TYPE %s`)) {
        securityKeys.columns.id = schema.users.columns.id;
    }

    if (query.includes(`ALTER COLUMN "user_id" TYPE %s`)) {
        securityKeys.columns.user_id = schema.users.columns.id;
    }

    if (query.includes(`ADD CONSTRAINT "${SECURITY_KEYS_FK}" FOREIGN KEY`)) {
        if (securityKeys.columns.user_id !== schema.users.columns.id) {
            throw new Error(`foreign key type mismatch: security_keys.user_id is ${securityKeys.columns.user_id}, users.id is ${schema.users.columns.id}`);
        }

        securityKeys.constraints.add(SECURITY_KEYS_FK);
    }
};

describe("webauthn1675044825710", () => {
    test("reconciles existing webauthn schema objects during up migration", async () => {
        const migration = new webauthn1675044825710();
        const { queries, queryRunner } = createRecordingQueryRunner();

        await migration.up(queryRunner);

        assert.equal(queries.length, 3);
        assert.match(queries[0], /users_id_type/);
        assert.match(queries[0], /CREATE TABLE "security_keys"/);
        assert.match(queries[0], /DROP CONSTRAINT IF EXISTS "FK_24c97d0771cafedce6d7163eaad"/);
        assert.match(queries[0], /ALTER COLUMN "id" TYPE %s/);
        assert.match(queries[0], /ALTER COLUMN "user_id" TYPE %s/);
        assert.match(queries[1], /ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "webauthn_enabled"/);
        assert.match(queries[2], /IF NOT EXISTS \(/);
        assert.match(queries[2], /FROM pg_constraint/);
        assert.match(queries[2], /conname = 'FK_24c97d0771cafedce6d7163eaad'/);
        assert.match(queries[2], /ALTER TABLE "security_keys" ADD CONSTRAINT "FK_24c97d0771cafedce6d7163eaad"/);
    });

    test("creates security_keys with bigint ids when users already uses bigint ids", async () => {
        const migration = new webauthn1675044825710();
        const { queryRunner, schema } = createSchemaQueryRunner("bigint");

        await migration.up(queryRunner);

        const securityKeys = getSecurityKeys(schema);
        assert.equal(securityKeys.columns.id, "bigint");
        assert.equal(securityKeys.columns.user_id, "bigint");
        assert.equal(schema.users.columns.webauthn_enabled, "boolean");
        assert.ok(securityKeys.constraints.has(SECURITY_KEYS_FK));
    });

    test("converts old varchar security_keys before adding the FK to bigint users", async () => {
        const migration = new webauthn1675044825710();
        const { queryRunner, schema } = createSchemaQueryRunner("bigint", {
            idType: "character varying",
            userIdType: "character varying",
            hasForeignKey: true,
        });

        await migration.up(queryRunner);

        const securityKeys = getSecurityKeys(schema);
        assert.equal(securityKeys.columns.id, "bigint");
        assert.equal(securityKeys.columns.user_id, "bigint");
        assert.ok(securityKeys.constraints.has(SECURITY_KEYS_FK));
    });

    test("keeps varchar security_keys ids when users still uses varchar ids", async () => {
        const migration = new webauthn1675044825710();
        const { queryRunner, schema } = createSchemaQueryRunner("character varying");

        await migration.up(queryRunner);

        const securityKeys = getSecurityKeys(schema);
        assert.equal(securityKeys.columns.id, "character varying");
        assert.equal(securityKeys.columns.user_id, "character varying");
        assert.ok(securityKeys.constraints.has(SECURITY_KEYS_FK));
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
