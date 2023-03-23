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
const specification = JSON.parse(
	fs.readFileSync(openapiPath, { encoding: "utf8" }),
);

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

	const tags = Array.from(routes.keys()).map((x) => getTag(x));
	specification.tags = specification.tags || [];
	specification.tags = [...specification.tags.map((x) => x.name), ...tags]
		.unique()
		.map((x) => ({ name: x }));

	specification.components = specification.components || {};
	specification.components.securitySchemes = {
		bearer: {
			type: "http",
			scheme: "bearer",
			description: "Bearer/Bot prefixes are not required.",
		},
	};

	routes.forEach((route, pathAndMethod) => {
		const [p, method] = pathAndMethod.split("|");
		const path = p.replace(/:(\w+)/g, "{$1}");

		specification.paths = specification.paths || {};
		let obj = specification.paths[path]?.[method] || {};
		obj["x-right-required"] = route.right;
		obj["x-permission-required"] = route.permission;
		obj["x-fires-event"] = route.test?.event;

		if (
			!NO_AUTHORIZATION_ROUTES.some((x) => {
				if (typeof x === "string") return path.startsWith(x);
				return x.test(path);
			})
		) {
			obj.security = [{ bearer: true }];
		}

		if (route.body) {
			obj.requestBody = {
				required: true,
				content: {
					"application/json": {
						schema: { $ref: `#/components/schemas/${route.body}` },
					},
				},
			}.merge(obj.requestBody);
		}

		if (route.responses) {
			for (const [k, v] of Object.entries(route.responses)) {
				let schema = {
					allOf: [
						{
							$ref: `#/components/schemas/${v.body}`,
						},
						{
							example: v.body,
						},
					],
				};
				if (!v.body) schema = schema.allOf[0];

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
							: {}),
					},
				}.merge(obj.responses);
				delete obj.responses.default;
			}
		}
		if (p.includes(":")) {
			obj.parameters = p.match(/:\w+/g)?.map((x) => ({
				name: x.replace(":", ""),
				in: "path",
				required: true,
				schema: { type: "string" },
				description: x.replace(":", ""),
			}));
		}
		obj.tags = [...(obj.tags || []), getTag(p)].unique();

		specification.paths[path] = {
			...specification.paths[path],
			[method]: obj,
		};
	});
}

function main() {
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
