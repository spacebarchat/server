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
import { CreateReportRequiredFields } from "./CreateReport";
import { ReportMenuType } from "./ReportMenu";

interface JsonShape {
    properties?: Record<string, JsonShape>;
    required?: string[];
    type?: string;
}

function readSchemas(): Record<string, JsonShape> {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "assets", "schemas.json"), "utf8")) as Record<string, JsonShape>;
}

test("CreateReportSchema exposes the scheduled event report id field used by clients", () => {
    const schema = readSchemas().CreateReportSchema;

    assert.ok(schema.properties?.guild_scheduled_event_id);
    assert.equal(schema.properties?.guild_scheduled_event_id.type, "string");
    assert.equal(schema.properties?.scheduled_event_id, undefined);
    assert.deepEqual(CreateReportRequiredFields[ReportMenuType.GUILD_SCHEDULED_EVENT], ["guild_id", "guild_scheduled_event_id"]);
});

test("CreateReportSchema validates scheduled event report payloads", () => {
    const payload = {
        version: "1.0",
        variant: "1",
        name: "guild_scheduled_event",
        language: "en-US",
        breadcrumbs: [10],
        guild_id: "100",
        guild_scheduled_event_id: "200",
    };

    assert.equal(ajv.validate("CreateReportSchema", payload), true);
    assert.equal(
        ajv.validate("CreateReportSchema", {
            ...payload,
            guild_scheduled_event_id: undefined,
            scheduled_event_id: "200",
        }),
        false,
    );
});

test("CreateReportRequiredFields covers every report menu type", () => {
    assert.deepEqual(Object.keys(CreateReportRequiredFields).sort(), Object.values(ReportMenuType).filter(Number.isInteger).map(String).sort());
});
