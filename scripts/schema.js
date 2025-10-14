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

/*
	Regenerates the `spacebarchat/server/assets/schemas.json` file, used for API/Gateway input validation.
*/

const conWarn = console.warn;
console.warn = (...args) => {
	// silence some expected warnings
	if (args[0] === "initializer is expression for property id") return;
	if (args[0].startsWith("unknown initializer for property ") && args[0].endsWith("[object Object]")) return;
	conWarn(...args);
}

const path = require("path");
const fs = require("fs");
const TJS = require("typescript-json-schema");
const walk = require("./util/walk");
const schemaPath = path.join(__dirname, "..", "assets", "schemas.json");

const settings = {
	required: true,
	ignoreErrors: true,
	excludePrivate: true,
	defaultNumberType: "integer",
	noExtraProps: true,
	defaultProps: false,
};

const ExcludeAndWarn = [
	/^Record/,
	/^Partial/,
]
const Excluded = [
	"DefaultSchema",
	"Schema",
	"EntitySchema",
	"ServerResponse",
	"Http2ServerResponse",
	"ExpressResponse",
	"global.Express.Response",
	"global.Response",
	"Response",
	"e.Response",
	"request.Response",
	"supertest.Response",
	"DiagnosticsChannel.Response",
	"_Response",
	"ReadableStream<any>",

	// TODO: Figure out how to exclude schemas from node_modules?
	"SomeJSONSchema",
	"UncheckedPartialSchema",
	"PartialSchema",
	"UncheckedPropertiesSchema",
	"PropertiesSchema",
	"AsyncSchema",
	"AnySchema",
	"SMTPConnection.CustomAuthenticationResponse",
	"TransportMakeRequestResponse",
	// Emma [it/its] @ Rory& - 2025-10-14
	/.*\..*/,
	/^Axios.*/,
	/^APIKeyConfiguration\..*/,
	/^AccountSetting\..*/,
	/^BulkContactManagement\..*/,
	/^Campaign.*/,
	/^Contact.*/,
	/^DNS\..*/,
	/^Delete.*/,
	/^Destroy.*/,
	/^Template\..*/,
	/^Webhook\..*/,
	/^(BigDecimal|BigInteger|Blob|Boolean|Document|Error|LazyRequest|List|Map|Normalized|Numeric)Schema/,
	/^Put/
];

function main() {
	const program = TJS.programFromConfig(
		path.join(__dirname, "..", "tsconfig.json"),
		walk(path.join(__dirname, "..", "src", "util", "schemas")),
	);
	const generator = TJS.buildGenerator(program, settings);
	if (!generator || !program) return;

	let schemas = generator.getUserSymbols().filter((x) => {
		return (
			(
				x.endsWith("Schema")
				||x.endsWith("Response")
				|| x.startsWith("API")
			)
			&& !ExcludeAndWarn.some(exc => {
				const match = exc instanceof RegExp ? exc.test(x) : x === exc;
				if (match) console.warn("Warning: Excluding schema", x);
				return match;
			})
			&& !Excluded.some(exc => exc instanceof RegExp ? exc.test(x) : x === exc)
		);
	});

	var definitions = {};

	for (const name of schemas) {
		console.log("Processing schema", name);
		const part = TJS.generateSchema(program, name, settings, [], generator);
		if (!part) continue;

		// this is a hack. want some want to check if its a @column, instead
		if (part.properties) {
			for (let key in part.properties) {
				if (
					[
						// BaseClass methods
						"toJSON",
						"hasId",
						"save",
						"remove",
						"softRemove",
						"recover",
						"reload",
						"assign",
					].includes(key)
				) {
					delete part.properties[key];
					continue;
				}
			}
		}

		definitions = { ...definitions, [name]: { ...part } };
	}

	deleteOneOfKindUndefinedRecursive(definitions, "$");

	fs.writeFileSync(schemaPath, JSON.stringify(definitions, null, 4));
	console.log("Successfully wrote", Object.keys(definitions).length, "schemas to", schemaPath);
}

function deleteOneOfKindUndefinedRecursive(obj, path) {
	if (
		obj?.type === "object" &&
		obj?.properties?.oneofKind?.type === "undefined"
	)
		return true;

	for (const key in obj) {
		if (
			typeof obj[key] === "object" &&
			deleteOneOfKindUndefinedRecursive(obj[key], path + "." + key)
		) {
			console.log("Deleting", path, key);
			delete obj[key];
		}
	}

	return false;
}

main();
