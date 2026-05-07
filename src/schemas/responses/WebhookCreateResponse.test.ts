import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

describe("WebhookCreateResponse schema", () => {
    const entityOnlyWebhookProperties = ["user_id", "guild", "channel", "application", "source_guild", "source_channel"];

    function collectRefs(value: unknown, refs: Set<string> = new Set()) {
        if (!value || typeof value !== "object") return refs;

        if ("$ref" in value && typeof value.$ref === "string") {
            refs.add(value.$ref);
        }

        for (const child of Object.values(value)) {
            collectRefs(child, refs);
        }

        return refs;
    }

    function assertSchemaDefinitionRefsResolve(schema: unknown, schemas: Record<string, unknown>) {
        for (const ref of collectRefs(schema)) {
            if (ref.startsWith("#/definitions/")) {
                const definitionName = decodeURIComponent(ref.slice("#/definitions/".length));
                assert.ok(schemas[definitionName], `${ref} does not resolve in assets/schemas.json`);
            }
        }
    }

    function assertOpenAPIRefsResolve(schema: unknown, components: Record<string, unknown>) {
        for (const ref of collectRefs(schema)) {
            if (ref.startsWith("#/components/schemas/")) {
                const schemaName = decodeURIComponent(ref.slice("#/components/schemas/".length));
                assert.ok(components[schemaName], `${ref} does not resolve in assets/openapi.json`);
            }
        }
    }

    test("describes the webhook object returned by webhook routes", () => {
        const schemas = JSON.parse(readFileSync("assets/schemas.json", "utf8"));
        const properties = schemas.WebhookCreateResponse.properties;

        assert.ok(properties.id);
        assert.ok(properties.type);
        assert.ok(properties.user);
        assert.ok(!properties.hook);
        for (const property of entityOnlyWebhookProperties) {
            assert.equal(properties[property], undefined);
        }
    });

    test("emits resolvable webhook response schemas", () => {
        const schemas = JSON.parse(readFileSync("assets/schemas.json", "utf8"));

        assert.ok(schemas.APIWebhook);
        assert.ok(schemas.WebhookCreateResponse);
        assert.ok(schemas.APIWebhookArray);
        assert.equal(schemas.APIWebhookArray.items.$ref, "#/definitions/APIWebhook");
        assertSchemaDefinitionRefsResolve(schemas.APIWebhook, schemas);
        assertSchemaDefinitionRefsResolve(schemas.WebhookCreateResponse, schemas);
        assertSchemaDefinitionRefsResolve(schemas.APIWebhookArray, schemas);
    });

    test("emits resolvable OpenAPI webhook response components", () => {
        const openapi = JSON.parse(readFileSync("assets/openapi.json", "utf8"));
        const components = openapi.components.schemas;

        assert.ok(components.APIWebhook);
        assert.ok(components.WebhookCreateResponse);
        assert.ok(components.APIWebhookArray);
        assert.equal(components.APIWebhookArray.items.$ref, "#/components/schemas/APIWebhook");
        assertOpenAPIRefsResolve(components.APIWebhook, components);
        assertOpenAPIRefsResolve(components.WebhookCreateResponse, components);
        assertOpenAPIRefsResolve(components.APIWebhookArray, components);
    });
});
