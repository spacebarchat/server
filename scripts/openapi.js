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
const getRouteDescriptions = require("./util/getRouteDescriptions");
const path = require("path");
const fs = require("fs");
const { NO_AUTHORIZATION_ROUTES } = require("../dist/api/middlewares/Authentication");
require("../dist/util/util/extensions");

const openapiPath = path.join(__dirname, "..", "assets", "openapi.json");
const SchemaPath = path.join(__dirname, "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));

let specification = {
	openapi: "3.1.0",
	info: {
		title: "Spacebar Server",
		description:
			"Spacebar is a Discord.com server implementation and extension, with the goal of complete feature parity with Discord.com, all while adding some additional goodies, security, privacy, and configuration options.",
		license: {
			name: "AGPLV3",
			url: "https://www.gnu.org/licenses/agpl-3.0.en.html",
		},
		version: "9",
	},
	externalDocs: {
		description: "Spacebar Docs",
		url: "https://docs.spacebar.chat",
	},
	servers: [
		{
			description: "Official Spacebar Instance",
			url: "https://old.server.spacebar.chat/api/v9",
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

const schemaRegEx = new RegExp(/^[\w.]+$/);
function combineSchemas(schemas) {
	let definitions = {};

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
		if (!schemaRegEx.test(key)) {
			console.error(`Invalid schema name: ${key}, context:`, definitions[key]);
			continue;
		}
		specification.components = specification.components || {};
		specification.components.schemas = specification.components.schemas || {};
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

function apiRoutes(missingRoutes) {
	const routes = getRouteDescriptions();

	// populate tags
	const tags = Array.from(routes.keys())
		.map((x) => getTag(x))
		.sort((a, b) => a.localeCompare(b));
	specification.tags = tags.distinct().map((x) => ({ name: x }));

	routes.forEach((route, pathAndMethod) => {
		const [p, method] = pathAndMethod.split("|");
		const path = p.replace(/:(\w+)/g, "{$1}");

		let obj = specification.paths[path]?.[method] || {};
		obj["x-right-required"] = route.right;
		obj["x-permission-required"] = route.permission;
		obj["x-fires-event"] = route.event;

		if (
			!NO_AUTHORIZATION_ROUTES.some((x) => {
				if (typeof x === "string") return (method.toUpperCase() + " " + path).startsWith(x);
				return x.test(method.toUpperCase() + " " + path);
			})
		) {
			obj.security = [{ bearer: [] }];
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
			};
		}

		if (route.responses) {
			obj.responses = {};

			for (const [statusCode, v] of Object.entries(route.responses)) {
				if (v.body)
					obj.responses[statusCode] = {
						description: obj?.responses?.[statusCode]?.description,
						content: {
							"application/json": {
								schema: {
									$ref: `#/components/schemas/${v.body}`,
								},
							},
						},
					};
				else
					obj.responses[statusCode] = {
						description: obj?.responses?.[statusCode]?.description || "No description available",
					};
			}

			if (route.ratelimitBucket) {
				obj["x-ratelimit-bucket"] = route.ratelimitBucket;
				obj.responses["429"] = {};
				if (obj.responses["200"]) {
					obj.responses["200"].headers ??= {};
					for (const key in ["Limit", "Remaining", "Reset", "Reset-After", "Bucket"]) {
						obj.responses["200"].headers[`X-RateLimit-${key}`] = {
							$ref: `#/components/headers/X-RateLimit-${key}`,
						};
					}
				}
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

		obj.tags = [...(obj.tags || []), getTag(p)].distinct();

		if (missingRoutes.additional.includes(path.replace(/\/$/, ""))) {
			obj["x-badges"] = [
				{
					label: "Spacebar-only",
					color: "red",
				},
			];
		}

		specification.paths[path] = Object.assign(specification.paths[path] || {}, {
			[method]: obj,
		});
	});

	// order top level
	const topLevelOrder = ["openapi", "info", "externalDocs", "servers", "paths", "tags", "components"];
	specification = Object.fromEntries(
		topLevelOrder
			.map((x) => [x, specification[x]])
			.filter((x) => x[1] !== undefined)
			.concat(Object.entries(specification).filter((x) => !topLevelOrder.includes(x[0]))),
	);
	// order paths alphabetically
	specification.paths = Object.fromEntries(Object.entries(specification.paths).sort((a, b) => a[0].localeCompare(b[0])));
}

async function main() {
	console.log("Generating OpenAPI Specification...");

	const routesRes = await fetch("https://github.com/spacebarchat/missing-routes/raw/main/missing.json", {
		headers: {
			Accept: "application/json",
		},
	});
	const missingRoutes = await routesRes.json();

	combineSchemas(schemas);
	apiRoutes(missingRoutes);

	fs.writeFileSync(openapiPath, JSON.stringify(specification, null, 4).replaceAll("#/definitions", "#/components/schemas").replaceAll("bigint", "number"));
	console.log("Wrote OpenAPI specification to", openapiPath);
	console.log("Specification contains", Object.keys(specification.paths).length, "paths and", Object.keys(specification.components.schemas).length, "schemas.");
}

main();
