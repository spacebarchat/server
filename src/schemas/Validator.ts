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

import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";

const SchemaPath = path.join(__dirname, "..", "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }).replaceAll("#/definitions/", ""));

// const schemas2 = {...schemas, definitions: {...schemas, }};
// console.log(schemas);
// for (const schemaName in schemas) {
// 	const schema = schemas[schemaName];
// 	if ("x-sb-defs" in schema) {
// 		console.log("[Validator] Adding definitions for schema", schemaName, ":", schema["x-sb-defs"]);
// 		for (const defKey of schema["x-sb-defs"]) {
// 			console.log(" - ", defKey, typeof schemas[defKey] === "object");
// 			schema.definitions = schema.definitions || {};
// 			if (schemas[defKey]) schema.definitions[defKey] = schemas[defKey];
// 			else console.warn("[Validator] Definition", defKey, "not found for schema", schemaName);
// 		}
// 	}
// }

export const ajv = new Ajv({
	allErrors: true,
	parseDate: true,
	allowDate: true,
	schemas: schemas,
	coerceTypes: true,
	messages: true,
	strict: true,
	strictRequired: true,
	allowUnionTypes: true,
});

addFormats(ajv);

export function validateSchema<G extends object>(schema: string, data: G): G {
	const valid = ajv.validate(schema, data);
	if (!valid) {
		console.log("[Validator] Validation error in ", schema);
		throw ajv.errors;
	}
	return data;
}
