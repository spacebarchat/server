/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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
const getRouteDescriptions = require("./util/getRouteDescriptions");
const path = require("path");
const fs = require("fs");
const {
	NO_AUTHORIZATION_ROUTES,
} = require("../dist/api/middlewares/Authentication");
require("missing-native-js-functions");

const openapiPath = path.join(__dirname, "..", "assets", "openapi.json");
const SchemaPath = path.join(__dirname, "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));
// const specification = JSON.parse(
// 	fs.readFileSync(openapiPath, { encoding: "utf8" }),
// );
let specification = {
	openapi: "3.1.0",
	info: {
		title: "Fosscord Server",
		description:
			"Fosscord is a free open source selfhostable discord compatible chat, voice and video platform",
		license: {
			name: "AGPLV3",
			url: "https://www.gnu.org/licenses/agpl-3.0.en.html",
		},
		version: "1.0.0",
	},
	externalDocs: {
		description: "Fosscord Docs",
		url: "https://docs.fosscord.com",
	},
	servers: [
		{
			url: "https://staging.fosscord.com/api/",
			description: "Official Fosscord Instance",
		},
	],
	components: {
		securitySchemes: {
			bearer: {
				type: "http",
				scheme: "bearer",
				description: "Bearer/Bot prefixes are not required.",
				bearerFormat: "JWT",
				in: "header",
			},
		},
	},
	tags: [],
	paths: {},
};

function combineSchemas(schemas) {
	var definitions = {};

	for (const name in schemas) {
		definitions = {
			...definitions,
			...schemas[name].definitions,
			[name]: {
				...schemas[name],
				definitions: undefined,
				$schema: undefined,
			},
		};
	}

	for (const key in definitions) {
		const reg = new RegExp(/^[a-zA-Z0-9\.\-_]+$/, "gm");
		if (!reg.test(key)) {
			console.error(`Invalid schema name: ${key} (${reg.test(key)})`);
			continue;
		}
		specification.components = specification.components || {};
		specification.components.schemas =
			specification.components.schemas || {};
		specification.components.schemas[key] = definitions[key];
		delete definitions[key].additionalProperties;
		delete definitions[key].$schema;
		const definition = definitions[key];

		if (typeof definition.properties === "object") {
			for (const property of Object.values(definition.properties)) {
				if (Array.isArray(property.type)) {
					if (property.type.includes("null")) {
						property.type = property.type.find((x) => x !== "null");
						property.nullable = true;
					}
				}
			}
		}
	}

	return definitions;
}

function getTag(key) {
	return key.match(/\/([\w-]+)/)[1];
}

function apiRoutes() {
	const routes = getRouteDescriptions();

	// populate tags
	const tags = Array.from(routes.keys())
		.map((x) => getTag(x))
		.sort((a, b) => a.localeCompare(b));
	specification.tags = tags.unique().map((x) => ({ name: x }));

	routes.forEach((route, pathAndMethod) => {
		const [p, method] = pathAndMethod.split("|");
		const path = p.replace(/:(\w+)/g, "{$1}");

		let obj = specification.paths[path]?.[method] || {};
		obj["x-right-required"] = route.right;
		obj["x-permission-required"] = route.permission;
		obj["x-fires-event"] = route.event;

		if (
			!NO_AUTHORIZATION_ROUTES.some((x) => {
				if (typeof x === "string") return path.startsWith(x);
				return x.test(path);
			})
		) {
			obj.security = [{ bearer: true }];
		}

		if (route.description) obj.description = route.description;
		if (route.summary) obj.summary = route.summary;
		if (route.deprecated) obj.deprecated = route.deprecated;

		if (route.requestBody) {
			obj.requestBody = {
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: `#/components/schemas/${route.requestBody}`,
						},
					},
				},
			}.merge(obj.requestBody);
		}

		if (route.responses) {
			for (const [k, v] of Object.entries(route.responses)) {
				let schema = {
					$ref: `#/components/schemas/${v.body}`,
				};

				obj.responses = {
					[k]: {
						...(v.body
							? {
									description:
										obj?.responses?.[k]?.description || "",
									content: {
										"application/json": {
											schema: schema,
										},
									},
							  }
							: {
									description: "No description available",
							  }),
					},
				}.merge(obj.responses);
			}
		} else {
			obj.responses = {
				default: {
					description: "No description available",
				},
			};
		}

		// handles path parameters
		if (p.includes(":")) {
			obj.parameters = p.match(/:\w+/g)?.map((x) => ({
				name: x.replace(":", ""),
				in: "path",
				required: true,
				schema: { type: "string" },
				description: x.replace(":", ""),
			}));
		}

		if (route.query) {
			// map to array
			const query = Object.entries(route.query).map(([k, v]) => ({
				name: k,
				in: "query",
				required: v.required,
				schema: { type: v.type },
				description: v.description,
			}));

			obj.parameters = [...(obj.parameters || []), ...query];
		}

		obj.tags = [...(obj.tags || []), getTag(p)].unique();

		specification.paths[path] = {
			[method]: obj,
		};
	});
}

function main() {
	console.log("Generating OpenAPI Specification...");
	combineSchemas(schemas);
	apiRoutes();

	fs.writeFileSync(
		openapiPath,
		JSON.stringify(specification, null, 4)
			.replaceAll("#/definitions", "#/components/schemas")
			.replaceAll("bigint", "number"),
	);
}

main();
