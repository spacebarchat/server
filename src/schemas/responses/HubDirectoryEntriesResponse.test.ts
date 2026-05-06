import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import Ajv from "ajv";

const schemaPath = path.join(process.cwd(), "assets", "schemas.json");
const rawSchemas = JSON.parse(readFileSync(schemaPath, "utf8"));
const ajvSchemas = JSON.parse(readFileSync(schemaPath, "utf8").replaceAll("#/definitions/", ""));

test("hub directory entry schema uses directory DTOs", () => {
    const schema = rawSchemas.HubDirectoryEntry;

    assert.equal(schema.properties.type.$ref, "#/definitions/HubDirectoryEntryType");
    assert.equal(schema.properties.guild.$ref, "#/definitions/HubDirectoryGuild");
    assert.equal(schema.properties.entity_id.type, "string");
    assert.deepEqual(schema.properties.description.type, ["null", "string"]);
    assert.ok(!schema.required.includes("primary_category_id"));
    assert.ok(schema.required.includes("guild"));
    assert.ok(!JSON.stringify(schema).includes("#/definitions/Guild"));

    assert.equal(rawSchemas.HubDirectoryEntryType.const, 0);
    assert.equal(rawSchemas.HubDirectoryGuild.properties.featurable_in_directory.type, "boolean");
    assert.ok(!rawSchemas.HubDirectoryGuild.required.includes("featurable_in_directory"));
});

test("hub directory entries validate documented guild entries", () => {
    const ajv = new Ajv({
        allErrors: true,
        schemas: ajvSchemas,
        strict: true,
        strictRequired: true,
        allowUnionTypes: true,
    });

    const validate = ajv.getSchema("HubDirectoryEntriesResponse");
    assert.ok(validate);

    assert.equal(
        validate([
            {
                type: 0,
                directory_channel_id: "123",
                entity_id: "456",
                created_at: "2026-05-06T00:00:00.000Z",
                description: null,
                author_id: "789",
                guild: {
                    id: "456",
                    name: "Directory Guild",
                    icon: "abcdef",
                },
            },
        ]),
        true,
    );

    assert.equal(
        validate([
            {
                type: 1,
                directory_channel_id: "123",
                entity_id: "456",
                created_at: "2026-05-06T00:00:00.000Z",
                description: "Scheduled events are not modeled by this schema yet",
                author_id: "789",
                guild: {
                    id: "456",
                    name: "Directory Guild",
                    icon: "abcdef",
                },
            },
        ]),
        false,
    );

    assert.equal(
        validate([
            {
                type: 1,
                directory_channel_id: "123",
                entity_id: "456",
                created_at: "2026-05-06T00:00:00.000Z",
                description: "Scheduled event entry",
                author_id: "789",
                guild_scheduled_event: {
                    id: "456",
                    guild_id: "999",
                    name: "Study hall",
                },
            },
        ]),
        false,
    );

    assert.equal(
        validate([
            {
                type: 0,
                directory_channel_id: "123",
                created_at: "2026-05-06T00:00:00.000Z",
                description: "Missing entity id",
                author_id: "789",
                guild: {
                    id: "456",
                    name: "Directory Guild",
                    icon: "abcdef",
                },
            },
        ]),
        false,
    );

    assert.equal(
        validate([
            {
                type: 0,
                directory_channel_id: "123",
                entity_id: "456",
                created_at: "2026-05-06T00:00:00.000Z",
                description: "Full entity fields are not part of the directory DTO",
                author_id: "789",
                guild: {
                    id: "456",
                    name: "Directory Guild",
                    icon: "abcdef",
                    owner_id: "789",
                },
            },
        ]),
        false,
    );
});
