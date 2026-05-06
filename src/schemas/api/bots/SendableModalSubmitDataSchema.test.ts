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
import { ajv } from "../../Validator";

const assetsPath = path.join(process.cwd(), "assets");

interface JsonShape {
    $ref?: string;
    anyOf?: JsonShape[];
    items?: JsonShape;
    oneOf?: JsonShape[];
    properties?: Record<string, JsonShape>;
    required?: string[];
    type?: string | string[];
}

function readAssetJson<T>(name: string): T {
    return JSON.parse(fs.readFileSync(path.join(assetsPath, name), "utf8")) as T;
}

function resolveRef(schemas: Record<string, JsonShape>, shape: JsonShape | undefined): JsonShape | undefined {
    if (!shape?.$ref?.startsWith("#/definitions/")) return shape;

    return schemas[shape.$ref.slice("#/definitions/".length)];
}

function unionRefs(schemas: Record<string, JsonShape>, shape: JsonShape | undefined): string[] {
    return (resolveRef(schemas, shape)?.anyOf ?? resolveRef(schemas, shape)?.oneOf ?? []).map((item) => item.$ref).filter((ref): ref is string => Boolean(ref));
}

test("SendableModalSubmitDataSchema exposes submitted modal components", () => {
    const schemas = readAssetJson<Record<string, JsonShape>>("schemas.json");

    assert.deepEqual(unionRefs(schemas, schemas.SendableModalSubmitDataSchema.properties?.components?.items).sort(), [
        "#/definitions/ModalSubmitActionRowComponentData",
        "#/definitions/ModalSubmitLabelComponentData",
        "#/definitions/ModalSubmitTextDisplayComponentData",
    ]);
    assert.deepEqual(unionRefs(schemas, schemas.ModalSubmitActionRowComponentData.properties?.components?.items).sort(), [
        "#/definitions/ModalSubmitCheckboxComponentData",
        "#/definitions/ModalSubmitCheckboxGroupComponentData",
        "#/definitions/ModalSubmitFileUploadComponentData",
        "#/definitions/ModalSubmitRadioGroupComponentData",
        "#/definitions/ModalSubmitSelectComponentData",
        "#/definitions/ModalSubmitTextInputComponentData",
    ]);
    assert.deepEqual(unionRefs(schemas, schemas.ModalSubmitLabelComponentData.properties?.component).sort(), [
        "#/definitions/ModalSubmitCheckboxComponentData",
        "#/definitions/ModalSubmitCheckboxGroupComponentData",
        "#/definitions/ModalSubmitFileUploadComponentData",
        "#/definitions/ModalSubmitRadioGroupComponentData",
        "#/definitions/ModalSubmitSelectComponentData",
        "#/definitions/ModalSubmitTextInputComponentData",
    ]);
    assert.deepEqual(schemas.ModalSubmitTextInputComponentData.required, ["custom_id", "type", "value"]);
    assert.deepEqual(schemas.SendableModalSubmitDataSchema.required, ["components", "custom_id", "id"]);
});

test("SendableModalSubmitDataSchema validates submitted text input values", () => {
    const modalSubmit = {
        id: "100",
        custom_id: "profile",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "bio",
                        value: "hello",
                    },
                ],
            },
        ],
    };

    assert.equal(ajv.validate("SendableModalSubmitDataSchema", modalSubmit), true);
    assert.equal(
        ajv.validate("SendableModalSubmitDataSchema", {
            id: "100",
            custom_id: "profile",
            components: [
                {
                    type: 18,
                    id: 1,
                    component: {
                        type: 3,
                        id: 2,
                        custom_id: "favorite_bug",
                        values: ["butterfly"],
                    },
                },
            ],
        }),
        true,
    );
    assert.equal(
        ajv.validate("SendableModalSubmitDataSchema", {
            id: "100",
            custom_id: "profile",
            components: [
                {
                    type: 18,
                    id: 1,
                    component: {
                        type: 23,
                        id: 2,
                        custom_id: "like_checkbox",
                        value: true,
                    },
                },
            ],
        }),
        true,
    );
    assert.equal(
        ajv.validate("SendableModalSubmitDataSchema", {
            ...modalSubmit,
            components: [{ type: 1, components: [{ type: 4, custom_id: "bio" }] }],
        }),
        false,
    );
    assert.equal(
        ajv.validate("SendableModalSubmitDataSchema", {
            ...modalSubmit,
            components: [{ type: 1, components: [{ type: 4, custom_id: "bio", value: "hello", label: "Bio" }] }],
        }),
        false,
    );
});
