/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

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

const assetsPath = path.join(process.cwd(), "assets");

interface JsonShape {
    $ref?: string;
    enum?: string[];
    items?: JsonShape;
    properties?: Record<string, JsonShape>;
    required?: string[];
    type?: string | string[];
}

function readAssetJson<T>(name: string): T {
    return JSON.parse(fs.readFileSync(path.join(assetsPath, name), "utf8")) as T;
}

function createWidgetResponse() {
    return {
        id: "100",
        name: "Widget guild",
        instant_invite: null,
        channels: [{ id: "200", name: "Voice", position: 0 }],
        members: [
            {
                id: "0",
                username: "1234",
                discriminator: "0000",
                avatar: null,
                status: "online",
                avatar_url: "https://cdn.example.invalid/widget-avatar.png",
            },
        ],
        presence_count: 1,
    };
}

test("GuildWidgetJsonResponse schema uses widget member status strings", () => {
    const schemas = readAssetJson<Record<string, JsonShape>>("schemas.json");
    const response = schemas.GuildWidgetJsonResponse;
    const member = response.properties?.members?.items;
    const status = member?.properties?.status;

    assert.deepEqual(status, { $ref: "#/definitions/GuildWidgetMemberStatus" });
    assert.deepEqual(schemas.GuildWidgetMemberStatus.enum?.toSorted(), ["dnd", "idle", "online"]);
    assert.equal(schemas.GuildWidgetMemberStatus.type, "string");
    assert.notEqual(status?.$ref, "#/definitions/ClientStatus");
    assert.equal(response.properties?.member_count, undefined);
    assert.equal(response.required?.includes("presence_count"), true);
    assert.equal(response.required?.includes("member_count"), false);
});

test("GuildWidgetJsonResponse validates widget payloads", () => {
    const response = createWidgetResponse();

    assert.equal(ajv.validate("GuildWidgetJsonResponse", response), true);
    assert.equal(ajv.validate("GuildWidgetJsonResponse", { ...response, member_count: 1 }), false);
});

test("GuildWidgetJsonResponse requires presence_count", () => {
    const { presence_count: _, ...responseWithoutPresenceCount } = createWidgetResponse();

    assert.equal(ajv.validate("GuildWidgetJsonResponse", responseWithoutPresenceCount), false);
});

test("GuildWidgetJsonResponse validates widget member statuses", () => {
    const response = createWidgetResponse();

    for (const status of ["online", "idle", "dnd"]) {
        assert.equal(
            ajv.validate("GuildWidgetJsonResponse", {
                ...response,
                members: [{ ...response.members[0], status }],
            }),
            true,
        );
    }

    for (const status of ["offline", "invisible", { web: "online" }]) {
        assert.equal(
            ajv.validate("GuildWidgetJsonResponse", {
                ...response,
                members: [{ ...response.members[0], status }],
            }),
            false,
        );
    }
});

test("GuildWidgetJsonResponse OpenAPI schema does not document member_count", () => {
    const openapi = readAssetJson<{
        components?: { schemas?: Record<string, JsonShape> };
    }>("openapi.json");
    const response = openapi.components?.schemas?.GuildWidgetJsonResponse;

    assert.ok(response, "GuildWidgetJsonResponse OpenAPI schema should exist");
    assert.equal(response.properties?.member_count, undefined);
    assert.equal(response.required?.includes("member_count"), false);
});
