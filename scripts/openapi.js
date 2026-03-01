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

const { Stopwatch } = require("../dist/util/util/Stopwatch");
const totalSw = Stopwatch.startNew();

require("module-alias/register");
const getRouteDescriptions = require("./util/getRouteDescriptions");
const path = require("path");
const fs = require("fs");
const { NO_AUTHORIZATION_ROUTES } = require("../dist/api/middlewares/Authentication");
require("../dist/util/util/extensions");
const { bgRedBright } = require("picocolors");

let zodModule;
let zodToJsonSchemaModule;
try {
    const z = require("zod");
    zodModule = z;
    if (z.toJSONSchema) {
        zodToJsonSchemaModule = (schema, opts) =>
            z.toJSONSchema(schema, {
                ...opts,
                unrepresentable: "any",
                override: (ctx) => {
                    const def = ctx.zodSchema._zod?.def;
                    if (def?.type === "date") {
                        ctx.jsonSchema.type = "string";
                        ctx.jsonSchema.format = "date-time";
                    }
                },
            });
    }
} catch (e) {}

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
        version: "1.0.0",
    },
    externalDocs: {
        description: "Spacebar Docs",
        url: "https://docs.spacebar.chat",
    },
    servers: [
        {
            url: "https://old.server.spacebar.chat/api/",
            description: "Official Spacebar Instance",
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
            console.error(` \x1b[5m${bgRedBright("ERROR")}\x1b[25m Invalid schema name: ${key}, context:`, definitions[key]);
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
                    if (property.type.length === 1) {
                        property.type = property.type[0];
                    }
                }

                if (Array.isArray(property.items)) {
                    property.prefixItems = property.items;
                    delete property.items;
                }
                if (Array.isArray(property.anyOf)) {
                    for (const anyOfItem of property.anyOf) {
                        if (Array.isArray(anyOfItem.items)) {
                            anyOfItem.prefixItems = anyOfItem.items;
                            delete anyOfItem.items;
                        }
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
    specification.tags = [...new Set(tags)].map((x) => ({ name: x }));

    routes.forEach((route, pathAndMethod) => {
        const [p, method] = pathAndMethod.split("|");
        let path = p.replace(/:(\w+)/g, "{$1}");
        if (path !== "/" && path.endsWith("/")) {
            path = path.slice(0, -1);
        }

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
        } else {
            obj.security = [];
        }

        if (route.description) obj.description = route.description;
        obj.summary = route.summary || "No summary provided";
        if (route.deprecated) obj.deprecated = route.deprecated;

        if (route.requestBody) {
            let schemaRef;

            if (zodModule && route.requestBody instanceof zodModule.ZodType) {
                let schemaName = null;
                try {
                    const schemasBaseDir = path.join(__dirname, "..", "dist", "schemas");
                    const dirs = ["uncategorised", "api/bots", "api/developers", "api/users", "api/reports", "webrtc"];
                    for (const dir of dirs) {
                        const dirPath = path.join(schemasBaseDir, dir);
                        if (!fs.existsSync(dirPath)) continue;
                        const schemasModule = require(dirPath);
                        for (const [name, value] of Object.entries(schemasModule)) {
                            if (value === route.requestBody) {
                                schemaName = name;
                                break;
                            }
                        }
                        if (schemaName) break;
                    }
                } catch (e) {}

                if (!schemaName) {
                    try {
                        const jsonSchema =
                            typeof zodToJsonSchemaModule === "function"
                                ? zodToJsonSchemaModule(route.requestBody, { target: "openApi3" })
                                : zodToJsonSchemaModule.zodToJsonSchema(route.requestBody, {
                                      target: "openApi3",
                                      $refStrategy: "none",
                                  });
                        delete jsonSchema.$schema;
                        schemaRef = jsonSchema;
                    } catch (e) {
                        schemaRef = { type: "object" };
                    }
                }

                if (schemaName) {
                    schemaRef = { $ref: `#/components/schemas/${schemaName}` };
                }
            } else {
                schemaRef = { $ref: `#/components/schemas/${route.requestBody}` };
            }

            if (schemaRef) {
                obj.requestBody = {
                    required: true,
                    content: {
                        "application/json": {
                            schema: schemaRef,
                        },
                    },
                };
            }
        }

        if (route.responses) {
            obj.responses = {};

            for (const [k, v] of Object.entries(route.responses)) {
                if (v.body)
                    obj.responses[k] = {
                        description: obj?.responses?.[k]?.description || "",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: `#/components/schemas/${v.body}`,
                                },
                            },
                        },
                    };
                else
                    obj.responses[k] = {
                        description: obj?.responses?.[k]?.description || "No description available",
                    };
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

        obj.tags = [...new Set([...(obj.tags || []), getTag(p)])];

        if (route.spacebarOnly === true || missingRoutes?.additional.includes(path.replace(/\/$/, ""))) {
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
}

async function main() {
    console.log("Generating OpenAPI Specification...");

    // const routesRes = await fetch("https://github.com/spacebarchat/missing-routes/raw/main/missing.json", {
    //     headers: {
    //         Accept: "application/json",
    //     },
    // });
    // const missingRoutes = await routesRes.json();
    let missingRoutes = undefined;

    combineSchemas(schemas);
    apiRoutes(missingRoutes);

    const outStr = JSON.stringify(specification, null, 4)
        .replaceAll("#/definitions", "#/components/schemas")
        .replace(/"type":\s*"bigint"/g, '"type": "number"');
    fs.writeFileSync(openapiPath, outStr);
    console.log("Wrote OpenAPI specification to", openapiPath);
    const elapsedMs = Number(totalSw.elapsed().totalMilliseconds + "." + totalSw.elapsed().microseconds);
    console.log(
        "Specification contains",
        Object.keys(specification.paths).length,
        "paths and",
        Object.keys(specification.components.schemas).length,
        "schemas in",
        elapsedMs,
        "ms.",
    );
}

main();
