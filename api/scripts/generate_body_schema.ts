// https://mermade.github.io/openapi-gui/#
// https://editor.swagger.io/
import path from "path";
import fs from "fs";
import * as TJS from "typescript-json-schema";
import "missing-native-js-functions";
const schemaPath = path.join(__dirname, "..", "assets", "schemas.json");

const settings: TJS.PartialArgs = {
	required: true,
	ignoreErrors: true,
	excludePrivate: true,
	defaultNumberType: "integer",
	noExtraProps: true,
	defaultProps: false
};
const compilerOptions: TJS.CompilerOptions = {
	strictNullChecks: false
};
const ExcludedSchemas = ["DefaultSchema", "Schema", "EntitySchema"];

function main() {
	const program = TJS.getProgramFromFiles(walk(path.join(__dirname, "..", "src", "routes")), compilerOptions);
	const generator = TJS.buildGenerator(program, settings);
	if (!generator || !program) return;

	const schemas = generator.getUserSymbols().filter((x) => x.endsWith("Schema") && !ExcludedSchemas.includes(x));
	console.log(schemas);

	var definitions: any = {};

	for (const name of schemas) {
		const part = TJS.generateSchema(program, name, settings, [], generator as TJS.JsonSchemaGenerator);
		if (!part) continue;

		definitions = { ...definitions, [name]: { ...part } };
	}

	fs.writeFileSync(schemaPath, JSON.stringify(definitions, null, 4));
}

// #/definitions/
main();

function walk(dir: string) {
	var results = [] as string[];
	var list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		var stat = fs.statSync(file);
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
