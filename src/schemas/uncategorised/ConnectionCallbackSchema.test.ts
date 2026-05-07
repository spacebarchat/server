import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import Ajv from "ajv";

const schemaPath = path.join(process.cwd(), "assets", "schemas.json");
const openApiPath = path.join(process.cwd(), "assets", "openapi.json");
const rawSchemas = JSON.parse(readFileSync(schemaPath, "utf8"));
const ajvSchemas = JSON.parse(readFileSync(schemaPath, "utf8").replaceAll("#/definitions/", ""));
const openApi = JSON.parse(readFileSync(openApiPath, "utf8"));

describe("ConnectionCallbackSchema", () => {
    test("emits typed OpenID params and Discord-compatible callback fields", () => {
        const schema = rawSchemas.ConnectionCallbackSchema;

        assert.equal(schema.properties.code.type, "string");
        assert.equal(schema.properties.state.type, "string");
        assert.equal(schema.properties.insecure.type, "boolean");
        assert.equal(schema.properties.friend_sync.type, "boolean");
        assert.equal(schema.properties.two_way_link_code.type, "string");
        assert.deepEqual(schema.properties.openid_params, {
            $ref: "#/definitions/ConnectionCallbackOpenIdParams",
        });
        assert.deepEqual(schema.required, ["code", "state"]);
        assert.deepEqual(rawSchemas.ConnectionCallbackOpenIdParams, {
            type: "object",
            additionalProperties: {
                type: "string",
            },
            $schema: "http://json-schema.org/draft-07/schema#",
        });
    });

    test("preserves typed OpenID params in generated OpenAPI", () => {
        assert.deepEqual(openApi.components.schemas.ConnectionCallbackOpenIdParams, {
            type: "object",
            additionalProperties: {
                type: "string",
            },
        });
        assert.deepEqual(openApi.components.schemas.ConnectionCallbackSchema.properties.openid_params, {
            $ref: "#/components/schemas/ConnectionCallbackOpenIdParams",
        });
    });

    test("validates callback payloads", () => {
        const ajv = new Ajv({
            allErrors: true,
            schemas: ajvSchemas,
            strict: true,
            strictRequired: true,
            allowUnionTypes: true,
        });

        const validate = ajv.getSchema("ConnectionCallbackSchema");
        assert.ok(validate);

        assert.equal(
            validate({
                code: "oauth-code",
                state: "state",
                openid_params: {
                    id_token: "id-token",
                    access_token: "access-token",
                    scope: "openid profile",
                },
            }),
            true,
        );

        assert.equal(
            validate({
                code: "oauth-code",
                state: "state",
                insecure: false,
                friend_sync: true,
                two_way_link_code: "device-code",
                openid_params: {
                    id_token: "id-token",
                    access_token: "access-token",
                    scope: "openid profile",
                },
            }),
            true,
        );

        assert.equal(
            validate({
                state: "state",
            }),
            false,
        );

        assert.equal(
            validate({
                code: "oauth-code",
            }),
            false,
        );

        assert.equal(
            validate({
                code: "oauth-code",
                state: "state",
                unexpected: "field",
            }),
            false,
        );

        assert.equal(
            validate({
                code: "oauth-code",
                state: "state",
                openid_params: "id-token",
            }),
            false,
        );

        assert.equal(
            validate({
                code: "oauth-code",
                state: "state",
                openid_params: {
                    id_token: {
                        nested: true,
                    },
                },
            }),
            false,
        );
    });
});
