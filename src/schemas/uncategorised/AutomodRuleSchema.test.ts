/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ajv } from "../Validator";

interface JsonShape {
    $ref?: string;
    anyOf?: JsonShape[];
    items?: JsonShape;
    properties?: Record<string, JsonShape>;
    required?: string[];
    type?: string;
}

function readSchemas(): Record<string, JsonShape> {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "assets", "schemas.json"), "utf8")) as Record<string, JsonShape>;
}

function resolveRef(schemas: Record<string, JsonShape>, shape: JsonShape | undefined): JsonShape | undefined {
    if (!shape?.$ref?.startsWith("#/definitions/")) return shape;

    return schemas[shape.$ref.slice("#/definitions/".length)];
}

test("AutomodRuleSchema exposes automod actions and array trigger metadata", () => {
    const schemas = readSchemas();
    const actions = schemas.AutomodRuleSchema.properties?.actions;
    const responseActions = schemas.AutomodRuleResponse.properties?.actions;
    const triggerMetadata = schemas.AutomodRuleSchema.properties?.trigger_metadata;
    const triggerMetadataRefs = (triggerMetadata?.anyOf ?? [])
        .map((shape) => shape.$ref)
        .filter(Boolean)
        .sort();

    assert.equal(actions?.type, "array");
    assert.equal(resolveRef(schemas, actions?.items)?.anyOf?.length, 4);
    assert.equal(responseActions?.type, "array");
    assert.equal(resolveRef(schemas, responseActions?.items)?.anyOf?.length, 4);
    assert.equal(schemas.AutomodRulesResponse.type, "array");
    assert.equal(schemas.AutomodRulesResponse.items?.$ref, "#/definitions/AutomodRuleResponse");
    assert.deepEqual(schemas.AutomodRuleSchema.required?.includes("actions"), true);
    assert.deepEqual(schemas.AutomodRuleResponse.required?.includes("id"), true);
    assert.equal(schemas.AutomodRuleModifySchema.required, undefined);
    assert.deepEqual(triggerMetadataRefs, [
        "#/definitions/AutomodCommonlyFlaggedWordsRuleSchema",
        "#/definitions/AutomodCustomWordsRuleSchema",
        "#/definitions/AutomodMentionSpamRuleSchema",
        "#/definitions/AutomodSuspectedSpamRuleSchema",
    ]);
    assert.equal(schemas.AutomodCustomWordsRuleSchema.properties?.keyword_filter?.type, "array");
    assert.equal(schemas.AutomodCommonlyFlaggedWordsRuleSchema.properties?.presets?.type, "array");
});

test("AutomodRuleSchema validates action metadata", () => {
    const rule = {
        creator_id: "100",
        enabled: true,
        event_type: 1,
        exempt_channels: ["200"],
        exempt_roles: ["300"],
        guild_id: "400",
        name: "mention spam",
        position: 0,
        actions: [
            {
                type: 1,
                metadata: {
                    custom_message: "Slow down",
                },
            },
            {
                type: 2,
                metadata: {
                    channel_id: "500",
                },
            },
            {
                type: 3,
                metadata: {
                    duration_seconds: 60,
                },
            },
        ],
        trigger_type: 5,
        trigger_metadata: {
            mention_total_limit: 5,
            mention_raid_protection_enabled: false,
        },
    };

    assert.equal(ajv.validate("AutomodRuleSchema", rule), true);
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            actions: [{ type: 1 }],
        }),
        true,
    );
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            actions: [{ type: 1, metadata: { channel_id: "500" } }],
        }),
        false,
    );
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            actions: [{ type: 2, metadata: {} }],
        }),
        false,
    );
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            actions: [{ type: 3, metadata: { channel_id: "500" } }],
        }),
        false,
    );
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            actions: [{ type: 4, metadata: { duration_seconds: 60 } }],
        }),
        true,
    );
    const ruleWithoutActions: Partial<typeof rule> = { ...rule };
    delete ruleWithoutActions.actions;
    assert.equal(ajv.validate("AutomodRuleSchema", ruleWithoutActions), false);
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            trigger_type: 3,
            trigger_metadata: null,
        }),
        true,
    );
    assert.equal(
        ajv.validate("AutomodRuleModifySchema", {
            actions: [{ type: 3, metadata: { duration_seconds: 60 } }],
        }),
        true,
    );
    assert.equal(ajv.validate("AutomodRuleModifySchema", {}), true);
    assert.equal(
        ajv.validate("AutomodRuleModifySchema", {
            actions: [{ type: 2, metadata: {} }],
        }),
        false,
    );
    assert.equal(
        ajv.validate("AutomodRuleSchema", {
            ...rule,
            trigger_metadata: {
                allow_list: ["allowed"],
                keyword_filter: ["blocked", "also blocked"],
                regex_patterns: ["^blocked$"],
            },
        }),
        true,
    );
});
