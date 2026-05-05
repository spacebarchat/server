import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import Ajv from "ajv";

const schemaPath = path.join(process.cwd(), "assets", "schemas.json");
const rawSchemas = JSON.parse(readFileSync(schemaPath, "utf8"));
const ajvSchemas = JSON.parse(readFileSync(schemaPath, "utf8").replaceAll("#/definitions/", ""));

test("connection callback schema emits typed OpenID params", () => {
    const schema = rawSchemas.ConnectionCallbackSchema;

    assert.equal(schema.properties.two_way_link_code.type, "string");
    assert.deepEqual(schema.properties.openid_params, {
        $ref: "#/definitions/ConnectionCallbackOpenIdParams",
    });
    assert.deepEqual(schema.required, ["friend_sync", "insecure", "state"]);
    assert.deepEqual(rawSchemas.ConnectionCallbackOpenIdParams, {
        type: "object",
        additionalProperties: {
            type: "string",
        },
        $schema: "http://json-schema.org/draft-07/schema#",
    });
});

test("connection callback schema validates OpenID callback payloads", () => {
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
            code: "oauth-code",
            state: "state",
            insecure: false,
            friend_sync: true,
            openid_params: "id-token",
        }),
        false,
    );

    assert.equal(
        validate({
            code: "oauth-code",
            state: "state",
            insecure: false,
            friend_sync: true,
            openid_params: {
                id_token: {
                    nested: true,
                },
            },
        }),
        false,
    );
});
