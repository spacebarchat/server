import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

type OpenApiSchema = {
    $ref?: string;
    required?: string[];
    properties?: Record<string, OpenApiSchema>;
    additionalProperties?: OpenApiSchema | boolean;
    type?: string;
};

type OpenApiDocument = {
    components: {
        schemas: Record<string, OpenApiSchema>;
    };
    paths: Record<string, Record<string, unknown>>;
};

describe("experiment route metadata", () => {
    const openapi = JSON.parse(readFileSync("assets/openapi.json", "utf8")) as OpenApiDocument;

    test("declares both client experiment endpoints", () => {
        assert.deepEqual(Object.keys(openapi.paths["/experiments/"]).sort(), ["get"]);
        assert.deepEqual(Object.keys(openapi.paths["/apex/experiments/"]).sort(), ["get"]);
    });

    test("does not require legacy fingerprints when a client already sent one", () => {
        assert.deepEqual(openapi.components.schemas.ExperimentsResponse.required, ["assignments", "guild_experiments"]);
    });

    test("models Apex assignments by unit type and unit id", () => {
        const assignments = openapi.components.schemas.ApexExperimentsResponse.properties?.assignments;
        assert.equal(assignments?.type, "object");

        const unitTypeMap = assignments?.additionalProperties as OpenApiSchema;
        assert.equal(unitTypeMap.type, "object");

        const unitAssignmentsRef = unitTypeMap.additionalProperties as OpenApiSchema;
        assert.equal(unitAssignmentsRef.$ref, "#/components/schemas/ApexExperimentUnitAssignments");

        const unitAssignments = openapi.components.schemas.ApexExperimentUnitAssignments;
        assert.deepEqual(unitAssignments.required, ["assignments", "evaluation_id"]);
        assert.equal(unitAssignments.properties?.evaluation_id.type, "string");
        assert.equal(unitAssignments.properties?.assignments.type, "array");
    });
});
