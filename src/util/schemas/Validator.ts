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

const SchemaPath = path.join(__dirname, "..", "..", "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));

export const ajv = new Ajv({
	allErrors: true,
	parseDate: true,
	allowDate: true,
	schemas,
	coerceTypes: true,
	messages: true,
	strict: true,
	strictRequired: true,
	allowUnionTypes: true,
});

addFormats(ajv);

export function validateSchema<G extends object>(schema: string, data: G): G {
	const valid = ajv.validate(schema, normalizeBody(data));
	if (!valid) throw ajv.errors;
	return data;
}

// Normalizer is introduced to workaround https://github.com/ajv-validator/ajv/issues/1287
// this removes null values as ajv doesn't treat them as undefined
// normalizeBody allows to handle circular structures without issues
// taken from https://github.com/serverless/serverless/blob/master/lib/classes/ConfigSchemaHandler/index.js#L30 (MIT license)
export const normalizeBody = (body: object = {}) => {
	const normalizedObjectsSet = new WeakSet();
	const normalizeObject = (object: object) => {
		if (normalizedObjectsSet.has(object)) return;
		normalizedObjectsSet.add(object);
		if (Array.isArray(object)) {
			for (const [, value] of object.entries()) {
				if (typeof value === "object") normalizeObject(value);
			}
		} else {
			for (const [key, value] of Object.entries(object)) {
				if (value == null) {
					if (
						key === "icon" ||
						key === "avatar" ||
						key === "banner" ||
						key === "splash" ||
						key === "discovery_splash"
					)
						continue;
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					delete object[key];
				} else if (typeof value === "object") {
					normalizeObject(value);
				}
			}
		}
	};
	normalizeObject(body);
	return body;
};
