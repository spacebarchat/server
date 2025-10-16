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

require("module-alias/register");
const path = require("path");
const fs = require("fs");
require("../dist/util/util/extensions");

const openapiPath = path.join(__dirname, "..", "assets", "openapi.json");
const openapiPathOut = path.join(__dirname, "..", "dist", "openapi_missing.json");
const SchemaPath = path.join(__dirname, "..", "assets", "schemas.json");
const sbOpenApi = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));

async function main() {
	console.log("Generating OpenAPI Specification...");

	const routesRes = await fetch(
		"https://raw.githubusercontent.com/discord/discord-api-spec/refs/heads/main/specs/openapi_preview.json",
		{
			headers: {
				Accept: "application/json",
			},
		},
	);
	const dOpenApi = await routesRes.json();
	for (const path in dOpenApi.paths) {
		if (!sbOpenApi.paths[path]) {
			console.log("Missing path:", path);
			continue;
		}

		for (const method in dOpenApi.paths[path]) {
			if(sbOpenApi.paths?.[path]?.[method]) delete sbOpenApi.paths[path][method];
		}
		if(Object.keys(sbOpenApi.paths?.[path]||{}).length === 0) delete sbOpenApi.paths[path];
	}



	fs.writeFileSync(
		openapiPathOut,
		JSON.stringify(dOpenApi, null, 4)
	);
	console.log("Wrote OpenAPI specification to", openapiPathOut);
	console.log(
		"Specification contains",
		Object.keys(specification.paths).length,
		"paths and",
		Object.keys(specification.components.schemas).length,
		"schemas.",
	);
}

main();
