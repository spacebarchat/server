import { describe, test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";

const schemas = JSON.parse(readFileSync(join(process.cwd(), "assets/schemas.json"), "utf8")) as Record<string, object>;
const ajv = new Ajv({ schemas: Object.entries(schemas).map(([key, schema]) => ({ ...schema, $id: key })) });

describe("APIDiscoveryCategoryArray", () => {
    const validate = ajv.compile({ ...schemas.APIDiscoveryCategoryArray, definitions: schemas });

    test("accepts categories without explicit localizations", () => {
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
});
