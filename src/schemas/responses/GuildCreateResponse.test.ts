/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
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
    items?: JsonShape;
    properties?: Record<string, JsonShape>;
    required?: string[];
    type?: string | string[];
}

function readAssetJson<T>(name: string): T {
    return JSON.parse(fs.readFileSync(path.join(assetsPath, name), "utf8")) as T;
}

test("GuildCreateResponse uses the schema-owned GuildWelcomeScreen DTO", () => {
    const schemas = readAssetJson<Record<string, JsonShape>>("schemas.json");
    const response = schemas.GuildCreateResponse;
    const welcomeScreen = schemas.GuildWelcomeScreen;

    assert.equal(response.properties?.welcome_screen?.$ref, "#/definitions/GuildWelcomeScreen");
    assert.equal(welcomeScreen.type, "object");
    assert.deepEqual(welcomeScreen.required, ["description", "enabled", "welcome_channels"]);
    assert.equal(welcomeScreen.properties?.welcome_channels?.items?.properties?.channel_id?.type, "string");
});

test("GuildWelcomeScreen remains wired to the welcome-screen route and validates payloads", () => {
    const openapi = readAssetJson<{
        components: { schemas: Record<string, JsonShape> };
        paths: Record<string, { get: { responses: Record<string, { content: Record<string, { schema: Record<string, string> }> }> } }>;
    }>("openapi.json");

    assert.deepEqual(openapi.paths["/guilds/{guild_id}/welcome-screen/"].get.responses["200"].content["application/json"].schema, {
        $ref: "#/components/schemas/GuildWelcomeScreen",
    });
    assert.equal(openapi.components.schemas.GuildCreateResponse.properties?.welcome_screen?.$ref, "#/components/schemas/GuildWelcomeScreen");

    assert.equal(
        ajv.validate("GuildWelcomeScreen", {
            enabled: true,
            description: "Welcome",
            welcome_channels: [{ channel_id: "100", description: "Read this first" }],
        }),
        true,
    );
    assert.equal(
        ajv.validate("GuildWelcomeScreen", {
            enabled: true,
            description: "Welcome",
            welcome_channels: [{ description: "Missing channel" }],
        }),
        false,
    );
});
