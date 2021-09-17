// https://mermade.github.io/openapi-gui/#
// https://editor.swagger.io/
import path from "path";
import fs from "fs";
import * as TJS from "typescript-json-schema";
import "missing-native-js-functions";

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
const openapiPath = path.join(__dirname, "..", "assets", "openapi.json");
var specification = JSON.parse(fs.readFileSync(openapiPath, { encoding: "utf8" }));

async function utilSchemas() {
	const program = TJS.getProgramFromFiles([path.join(__dirname, "..", "..", "util", "src", "index.ts")], compilerOptions);
	const generator = TJS.buildGenerator(program, settings);

	const schemas = ["UserPublic", "UserPrivate", "PublicConnectedAccount"];

	// @ts-ignore
	combineSchemas({ schemas, generator, program });
}

function combineSchemas(opts: { program: TJS.Program; generator: TJS.JsonSchemaGenerator; schemas: string[] }) {
	var definitions: any = {};

	for (const name of opts.schemas) {
		const part = TJS.generateSchema(opts.program, name, settings, [], opts.generator as TJS.JsonSchemaGenerator);
		if (!part) continue;

		definitions = { ...definitions, [name]: { ...part, definitions: undefined, $schema: undefined } };
	}

	for (const key in definitions) {
		specification.components.schemas[key] = definitions[key];
		delete definitions[key].additionalProperties;
		delete definitions[key].$schema;
	}

	return definitions;
}

const ExcludedSchemas = [
	"DefaultSchema",
	"Schema",
	"EntitySchema",
	"ServerResponse",
	"Http2ServerResponse",
	"global.Express.Response",
	"Response",
	"e.Response",
	"request.Response",
	"supertest.Response"
];

function apiSchemas() {
	const program = TJS.getProgramFromFiles([path.join(__dirname, "..", "src", "schema", "index.ts")], compilerOptions);
	const generator = TJS.buildGenerator(program, settings);

	const schemas = generator
		.getUserSymbols()
		.filter((x) => x.endsWith("Response") && !ExcludedSchemas.includes(x))
		.concat(generator.getUserSymbols().filter((x) => x.endsWith("Schema") && !ExcludedSchemas.includes(x)));

	// @ts-ignore
	combineSchemas({ schemas, generator, program });
}

function addDefaultResponses() {
	Object.values(specification.paths).forEach((path: any) => Object.values(path).forEach((request: any) => {}));
}

function main() {
	addDefaultResponses();
	utilSchemas();
	apiSchemas();

	fs.writeFileSync(
		openapiPath,
		JSON.stringify(specification, null, 4).replaceAll("#/definitions", "#/components/schemas").replaceAll("bigint", "number")
	);
}

main();
