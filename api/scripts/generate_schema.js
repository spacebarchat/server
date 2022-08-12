// https://mermade.github.io/openapi-gui/#
// https://editor.swagger.io/
const path = require("path");
const fs = require("fs");
const TJS = require("typescript-json-schema");
require("missing-native-js-functions");
const schemaPath = path.join(__dirname, "..", "assets", "schemas.json");

const settings = {
	required: true,
	ignoreErrors: true,
	excludePrivate: true,
	defaultNumberType: "integer",
	noExtraProps: true,
	defaultProps: false
};
const compilerOptions = {
	strictNullChecks: true
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
	for (let k in obj) {
		if (typeof obj[k] === "object" && obj[k] !== null) {
			modify(obj[k]);
		}
	}
}

function main() {
	const files = [
		...walk(path.join(__dirname, "..", "..", "util", "src", "schemas")),
	];
	const program = TJS.getProgramFromFiles(
		files,
		compilerOptions
	);
	const generator = TJS.buildGenerator(program, settings);
	if (!generator || !program) return;

	let schemas = generator.getUserSymbols().filter((x) => (x.endsWith("Schema") || x.endsWith("Response")) && !Excluded.includes(x));
	console.log(schemas);

	let definitions = {};

	for (const name of schemas) {
		const part = TJS.generateSchema(program, name, settings, [], generator);
		if (!part) continue;

		definitions = { ...definitions, [name]: { ...part } };
	}

	modify(definitions);

	fs.writeFileSync(schemaPath, JSON.stringify(definitions, null, 4));
}

main();

function walk(dir) {
	let results = [];
	let list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		let stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file));
		} else {
			if (!file.endsWith(".ts")) return;
			results.push(file);
		}
	});
	return results;
}
