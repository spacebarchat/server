/*
	Regenerates the `fosscord-server/assets/schemas.json` file, used for API/Gateway input validation.
*/

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
const compilerOptions = {
	strictNullChecks: true,
};
const Excluded = [
	"DefaultSchema",
	"Schema",
	"EntitySchema",
	"ServerResponse",
	"Http2ServerResponse",
	"global.Express.Response",
	"Response",
	"e.Response",
	"request.Response",
	"supertest.Response",

	// TODO: Figure out how to exclude schemas from node_modules?
	"SomeJSONSchema",
	"UncheckedPartialSchema",
	"PartialSchema",
	"UncheckedPropertiesSchema",
	"PropertiesSchema",
	"AsyncSchema",
	"AnySchema",
];

function modify(obj) {
	for (var k in obj) {
		if (typeof obj[k] === "object" && obj[k] !== null) {
			modify(obj[k]);
		}
	}
}

function main() {
	const program = TJS.programFromConfig(
		path.join(__dirname, "..", "tsconfig.json"),
		walk(path.join(__dirname, "..", "src", "util", "schemas")),
	);
	const generator = TJS.buildGenerator(program, settings);
	if (!generator || !program) return;

	let schemas = generator
		.getUserSymbols()
		.filter(
			(x) =>
				(x.endsWith("Schema") || x.endsWith("Response")) &&
				!Excluded.includes(x),
		);
	console.log(schemas);

	var definitions = {};

	for (const name of schemas) {
		const part = TJS.generateSchema(program, name, settings, [], generator);
		if (!part) continue;

		// this is a hack. want some want to check if its a @column, instead
		if (part.properties)
			Object.keys(part.properties)
				.filter((key) =>
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
					].includes(key),
				)
				.forEach((key) => delete part.properties[key]);

		definitions = { ...definitions, [name]: { ...part } };
	}

	modify(definitions);

	fs.writeFileSync(schemaPath, JSON.stringify(definitions, null, 4));
}

main();
