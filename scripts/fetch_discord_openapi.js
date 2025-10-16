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

const openapiPathOut = path.join(__dirname, "..", "dist", "openapi_discord.json");

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
	for (const pathName in dOpenApi.paths) {
		console.log("Processing path:", pathName);
		const path = dOpenApi.paths[pathName];
		for (const methodName in path) {
			if (methodName === 'parameters') continue;
			console.log("  Processing method:", methodName);
			const method = path[methodName];
			if (method.operationId)
				// delete dOpenApi.paths[path][methodName].operationId;
				delete method.operationId; // we don't care about these

			for (const respCode in method.responses) {
				console.log("    Processing response:", respCode);
				const resp = method.responses[respCode];
				if(resp.description)
					delete resp.description; // we don't care about these

			}

			console.log("    Method security:", JSON.stringify(method.security));
			// if(method.security?.length >= 1 && method.security[0]?.["BotToken"] !== undefined) {
			// 	console.log("    Converting BotToken security to bearer");
			// 	// BotToken -> bearer
			// 	method.security[0]["bearer"] = [];
			// 	delete method.security[0]["BotToken"];
			// }
			for (const securityObj of method.security||[]) {
				if(securityObj["BotToken"] !== undefined) {
					console.log("    Converting BotToken security to bearer");
					// BotToken -> bearer
					securityObj["bearer"] = [];
					delete securityObj["BotToken"];
				}
			}
		}
	}



	fs.writeFileSync(
		openapiPathOut,
		JSON.stringify(dOpenApi, null, 2)
	);
	console.log("Wrote OpenAPI specification to", openapiPathOut);
	console.log(
		"Specification contains",
		Object.keys(dOpenApi.paths).length,
		"paths and",
		Object.keys(dOpenApi.components.schemas).length,
		"schemas.",
	);
}

main();
