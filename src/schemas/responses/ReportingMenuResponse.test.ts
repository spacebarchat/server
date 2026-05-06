import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { ReportButtonType, ReportMenuTypeNames } from "../api/reports/ReportMenu";
import { ReportingMenuResponse } from "./ReportingMenuResponse";

const menuDirectory = path.join(process.cwd(), "assets", "temp_report_menu_responses");

function assertStringOrNull(value: unknown, field: string) {
    assert.ok(typeof value === "string" || value === null, `${field} must be a string or null`);
}

function assertStringNumberTuple(value: unknown, field: string) {
    assert.ok(Array.isArray(value), `${field} must be an array`);
    assert.equal(value.length, 2, `${field} must have two entries`);
    assert.equal(typeof value[0], "string", `${field}[0] must be a string`);
    assert.equal(typeof value[1], "number", `${field}[1] must be a number`);
}

function assertStringArray(value: unknown, field: string) {
    assert.ok(Array.isArray(value), `${field} must be an array`);
    assert.ok(
        value.every((item) => typeof item === "string"),
        `${field} must contain strings`,
    );
}

function assertElementData(value: unknown, field: string) {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
            assertStringArray(item, `${field}[${index}]`);
        }
        return;
    }

    assert.equal(typeof value, "object", `${field} must be an object when present`);
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        assert.ok(["string", "number", "boolean"].includes(typeof item) || item === null, `${field}.${key} has unsupported value type`);
    }
}

function assertReportingMenuResponse(menu: ReportingMenuResponse, expectedName: string) {
    assert.equal(menu.name, expectedName);
    assert.equal(typeof menu.variant, "string");
    assert.equal(typeof menu.version, "string");
    assert.equal(typeof menu.postback_url, "string");
    assert.equal(typeof menu.root_node_id, "number");
    assert.equal(typeof menu.success_node_id, "number");
    assert.equal(typeof menu.fail_node_id, "number");
    assert.equal(typeof menu.nodes, "object");

    for (const [nodeId, node] of Object.entries(menu.nodes)) {
        assert.equal(typeof node.id, "number", `nodes.${nodeId}.id must be a number`);
        assert.equal(typeof node.key, "string", `nodes.${nodeId}.key must be a string`);
        assertStringOrNull(node.header, `nodes.${nodeId}.header`);
        assertStringOrNull(node.subheader, `nodes.${nodeId}.subheader`);
        assertStringOrNull(node.info, `nodes.${nodeId}.info`);
        assertStringOrNull(node.report_type, `nodes.${nodeId}.report_type`);

        if (node.button !== null) {
            assert.ok(Object.values(ReportButtonType).includes(node.button.type), `nodes.${nodeId}.button.type must be a known report button type`);
            assert.ok(typeof node.button.target === "number" || node.button.target === null, `nodes.${nodeId}.button.target must be a number or null`);
        }

        assert.ok(Array.isArray(node.children), `nodes.${nodeId}.children must be an array`);
        for (const [index, child] of node.children.entries()) assertStringNumberTuple(child, `nodes.${nodeId}.children[${index}]`);

        assert.ok(Array.isArray(node.elements), `nodes.${nodeId}.elements must be an array`);
        for (const [index, element] of node.elements.entries()) {
            assert.equal(typeof element.name, "string", `nodes.${nodeId}.elements[${index}].name must be a string`);
            assert.equal(typeof element.type, "string", `nodes.${nodeId}.elements[${index}].type must be a string`);
            assert.equal(typeof element.is_localized, "boolean", `nodes.${nodeId}.elements[${index}].is_localized must be a boolean`);
            if ("header" in element) assertStringOrNull(element.header, `nodes.${nodeId}.elements[${index}].header`);
            if ("body" in element) assertStringOrNull(element.body, `nodes.${nodeId}.elements[${index}].body`);
            if (element.exclusions)
                assert.ok(
                    element.exclusions.every((countryCode) => typeof countryCode === "string"),
                    `nodes.${nodeId}.elements[${index}].exclusions must contain strings`,
                );
            assertElementData(element.data, `nodes.${nodeId}.elements[${index}].data`);
        }
    }
}

describe("ReportingMenuResponse", () => {
    it("should describe all static reporting menu responses served by the reporting routes", async () => {
        const expectedNames = Object.values(ReportMenuTypeNames).sort();
        const menuFiles = (await fs.readdir(menuDirectory)).filter((file) => file.endsWith(".json")).sort();

        assert.deepEqual(
            menuFiles.map((file) => path.basename(file, ".json")),
            expectedNames,
        );

        for (const file of menuFiles) {
            const menu = JSON.parse(await fs.readFile(path.join(menuDirectory, file), "utf-8")) as ReportingMenuResponse;
            assertReportingMenuResponse(menu, path.basename(file, ".json"));
        }
    });
});
