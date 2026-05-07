import { describe, test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";

const schemas = JSON.parse(readFileSync(join(process.cwd(), "assets/schemas.json"), "utf8")) as Record<string, object>;
const openapi = JSON.parse(readFileSync(join(process.cwd(), "assets/openapi.json"), "utf8")) as {
    components: { schemas: Record<string, object> };
};
const ajv = new Ajv({ schemas: Object.entries(schemas).map(([key, schema]) => ({ ...schema, $id: key })) });

describe("APIDiscoveryCategoryArray", () => {
    const validate = ajv.compile({ ...schemas.APIDiscoveryCategoryArray, definitions: schemas });

    test("accepts categories with empty localizations", () => {
        assert.strictEqual(
            validate([
                {
                    id: 1,
                    name: "Gaming",
                    localizations: {},
                    is_primary: true,
                },
            ]),
            true,
        );
    });

    test("accepts categories with string localization maps", () => {
        assert.strictEqual(
            validate([
                {
                    id: 1,
                    name: "Gaming",
                    localizations: {
                        de: "Gaming",
                        fr: "Jeux",
                    },
                    is_primary: true,
                },
            ]),
            true,
        );
    });

    test("requires localizations to be an object", () => {
        assert.strictEqual(
            validate([
                {
                    id: 1,
                    name: "Gaming",
                    localizations: "Gaming",
                    is_primary: true,
                },
            ]),
            false,
        );
    });

    test("requires localization values to be strings", () => {
        assert.strictEqual(
            validate([
                {
                    id: 1,
                    name: "Gaming",
                    localizations: {
                        de: 123,
                    },
                    is_primary: true,
                },
            ]),
            false,
        );

        assert.strictEqual(
            validate([
                {
                    id: 1,
                    name: "Gaming",
                    localizations: {
                        de: null,
                    },
                    is_primary: true,
                },
            ]),
            false,
        );
    });

    test("does not allow null localizations", () => {
        assert.strictEqual(
            validate([
                {
                    id: 1,
                    name: "Gaming",
                    localizations: null,
                    is_primary: true,
                },
            ]),
            false,
        );
    });

    test("publishes localization string maps in OpenAPI", () => {
        assert.deepStrictEqual(openapi.components.schemas.CategoryLocalizations, {
            type: "object",
            additionalProperties: {
                type: "string",
            },
        });
    });
});
