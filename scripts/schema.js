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
const { Stopwatch } = require("../dist/util/util/Stopwatch");
const totalSw = Stopwatch.startNew();

const conWarn = console.warn;
console.warn = (...args) => {
	// silence some expected warnings
	if (args[0] === "initializer is expression for property id") return;
	if (args[0].startsWith("unknown initializer for property ") && args[0].endsWith("[object Object]")) return;
	conWarn(...args);
};

const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const TJS = require("typescript-json-schema");
const walk = require("./util/walk");
const { redBright, yellowBright, bgRedBright, yellow, greenBright, green, cyanBright } = require("picocolors");
const schemaPath = path.join(__dirname, "..", "assets", "schemas.json");
const exclusionList = JSON.parse(fs.readFileSync(path.join(__dirname, "schemaExclusions.json"), { encoding: "utf8" }));

const settings = {
	required: true,
	ignoreErrors: true,
	excludePrivate: true,
	defaultNumberType: "integer",
	noExtraProps: true,
	defaultProps: false,
};

const baseClassProperties = [
	// BaseClass methods
	"toJSON",
	"hasId",
	"save",
	"remove",
	"softRemove",
	"recover",
	"reload",
	"assign",
	"_do_validate", // ?
	"hasId", // ?
];

const ExcludeAndWarn = [...exclusionList.manualWarn, ...exclusionList.manualWarnRe.map((r) => new RegExp(r))];
const Excluded = [...exclusionList.manual, ...exclusionList.manualRe.map((r) => new RegExp(r)), ...exclusionList.auto.map((r) => r.value)];
const Included = [...exclusionList.include, ...exclusionList.includeRe.map((r) => new RegExp(r))];

const excludedLambdas = [
	(n, s) => {
		// attempt to import
		if (JSON.stringify(s).includes(`#/definitions/import(`)) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as it attempted to use import().`);
			exclusionList.auto.push({ value: n, reason: "Uses import()" });
			return true;
		}
	},
	(n, s) => {
		if (JSON.stringify(s).includes(process.cwd())) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as it leaked $PWD.`);
			exclusionList.auto.push({ value: n, reason: "Leaked $PWD" });
			return true;
		}
	},
	(n, s) => {
		if (JSON.stringify(s).includes(process.env.HOME)) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as it leaked a $HOME path.`);
			exclusionList.auto.push({ value: n, reason: "Leaked $HOME" });
			return true;
		}
	},
	(n, s) => {
		if (s["$ref"] === `#/definitions/${n}`) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as it is a self-reference only schema.`);
			exclusionList.auto.push({ value: n, reason: "Self-reference only schema" });
			// fs.writeFileSync(`fucked/${n}.json`, JSON.stringify(s, null, 4));
			return true;
		}
	},
	(n, s) => {
		if (s.description?.match(/Smithy/)) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as it appears to be an AWS Smithy schema.`);
			exclusionList.auto.push({ value: n, reason: "AWS Smithy schema" });
			return true;
		}
	},
	(n, s) => {
		if (s.description?.startsWith("<p>")) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as we don't use HTML paragraphs for descriptions.`);
			exclusionList.auto.push({ value: n, reason: "HTML paragraph in description" });
			return true;
		}
	},
	(n, s) => {
		if (s.properties && Object.keys(s.properties).every((x) => x[0] === x[0].toUpperCase())) {
			console.log(`\r${redBright("[WARN]")} Omitting schema ${n} as all its properties have uppercase characters.`);
			exclusionList.auto.push({ value: n, reason: "Schema with only uppercase properties" });
			return true;
		}
	},
	// (n, s) => {
	// 	if (JSON.stringify(s).length <= 300) {
	// 		console.log({n, s});
	// 	}
	// }
];

function includesMatch(haystack, needles, log = false) {
	for (const needle of needles) {
		const match = needle instanceof RegExp ? needle.test(haystack) : haystack === needle;
		if (match) {
			if (log) console.warn(redBright("[WARN]:"), "Excluding schema", haystack, "due to match with", needle);
			return needle;
		}
	}
	return null;
}

async function main() {
	const stepSw = Stopwatch.startNew();

	process.stdout.write("Loading program... ");
	const program = TJS.programFromConfig(path.join(__dirname, "..", "tsconfig.json"), walk(path.join(__dirname, "..", "src", "schemas")));
	const generator = TJS.buildGenerator(program, settings);
	if (!generator || !program) {
		console.log(redBright("Failed to create schema generator."));
		return;
	}

	const elapsedLoad = stepSw.getElapsedAndReset();
	process.stdout.write("Done in " + yellowBright(elapsedLoad.totalMilliseconds + "." + elapsedLoad.microseconds) + " ms\n");

	process.stdout.write("Generating schema list... ");
	let schemas = generator.getUserSymbols().filter((x) => {
		return (
			(x.endsWith("Schema") || x.endsWith("Response") || x.startsWith("API")) &&
			// !ExcludeAndWarn.some((exc) => {
			// 	const match = exc instanceof RegExp ? exc.test(x) : x === exc;
			// 	if (match) console.warn("Warning: Excluding schema", x);
			// 	return match;
			// }) &&
			// !Excluded.some((exc) => (exc instanceof RegExp ? exc.test(x) : x === exc))
			(includesMatch(x, Included) || (!includesMatch(x, ExcludeAndWarn, true) && !includesMatch(x, Excluded)))
		);
	});
	//.sort((a,b) => a.localeCompare(b));

	const elapsedList = stepSw.getElapsedAndReset();
	process.stdout.write("Done in " + yellowBright(elapsedList.totalMilliseconds + "." + elapsedList.microseconds) + " ms\n");
	console.log("Found", yellowBright(schemas.length), "schemas to process.");

	let definitions = {};
	let nestedDefinitions = {};
	let writePromises = [];

	if (process.env.WRITE_SCHEMA_DIR === "true") {
		fs.rmSync("schemas_orig", { recursive: true, force: true });
		fs.mkdirSync("schemas_orig");

		fs.rmSync("schemas_nested", { recursive: true, force: true });
		fs.mkdirSync("schemas_nested");

		fs.rmSync("schemas_final", { recursive: true, force: true });
		fs.mkdirSync("schemas_final");
	}

	const schemaSw = Stopwatch.startNew();
	for (const name of schemas) {
		process.stdout.write(`Processing schema ${name}... `);
		const part = TJS.generateSchema(program, name, settings, [], generator);
		if (!part) continue;

		filterSchema(part);

		if (definitions[name]) {
			process.stdout.write(yellow(` [ERROR] Duplicate schema name detected: ${name}. Overwriting previous schema.`));
		}

		if (!includesMatch(name, Included) && excludedLambdas.some((fn) => fn(name, part))) {
			continue;
		}

		if (process.env.WRITE_SCHEMA_DIR === "true") writePromises.push(fsp.writeFile(path.join("schemas_orig", `${name}.json`), JSON.stringify(part, null, 4)));

		// testing:
		function mergeDefs(schemaName, schema) {
			if (schema.definitions) {
				// schema["x-sb-defs"] = Object.keys(schema.definitions);
				process.stdout.write(cyanBright("Processing nested... "));
				for (const defKey in schema.definitions) {
					if (definitions[defKey] && deepEqual(definitions[defKey], schema.definitions[defKey])) {
						// console.log("Definition", defKey, "from schema", schemaName, "is identical to existing definition, skipping.");
						schema.definitions = Object.fromEntries(Object.entries(schema.definitions).filter(([k, v]) => k !== defKey));
						process.stdout.write(greenBright("T"));
					} else if (!nestedDefinitions[defKey]) {
						nestedDefinitions[defKey] = schema.definitions[defKey];
						schema.definitions = Object.fromEntries(Object.entries(schema.definitions).filter(([k, v]) => k !== defKey));
						// console.log("Tracking sub-definition", defKey, "from schema", schemaName);
						process.stdout.write(green("N"));
					} else if (!deepEqual(nestedDefinitions[defKey], schema.definitions[defKey])) {
						console.log(redBright("[ERROR]"), "Conflicting nested definition for", defKey, "found in schema", schemaName);
						console.log(columnizedObjectDiff(nestedDefinitions[defKey], schema.definitions[defKey], true));
					} else {
						// console.log("Definition", defKey, "from schema", schemaName, "is identical to existing definition, skipping.");
						schema.definitions = Object.fromEntries(Object.entries(schema.definitions).filter(([k, v]) => k !== defKey));
						process.stdout.write(greenBright("M"));
					}
				}
				if (Object.keys(schema.definitions).length === 0) {
					process.stdout.write(greenBright("✓ "));
					delete schema.definitions;
				} else {
					console.log("Remaining definitions in schema", schemaName, "after merge:", Object.keys(schema.definitions));
				}
			}
		}
		mergeDefs(name, part);

		const elapsed = schemaSw.getElapsedAndReset();
		process.stdout.write("Done in " + yellowBright(elapsed.totalMilliseconds + "." + elapsed.microseconds) + " ms, " + yellowBright(JSON.stringify(part).length) + " bytes (unformatted) ");
		if (elapsed.totalMilliseconds >= 20) console.log(bgRedBright("\x1b[5m[SLOW]\x1b[25m"));
		else console.log();

		definitions = { ...definitions, [name]: { ...part } };
	}
	console.log("Processed", Object.keys(definitions).length, "schemas in", Number(stepSw.elapsed().totalMilliseconds + "." + stepSw.elapsed().microseconds), "ms.");

	console.log("Merging nested definitions into main definitions...");
	let isNewLine = true;
	for (const defKey in nestedDefinitions) {
		if (!includesMatch(defKey, Included, false)) {
			const bannedMatch = includesMatch(defKey, ExcludeAndWarn, false) ?? includesMatch(defKey, Excluded, false);
			if (bannedMatch !== null) {
				// console.log(yellowBright("\n[WARN]"), "Skipping nested definition", defKey, "as it matched a banned format.");
				console.log((isNewLine ? "" : "\n") + redBright("WARNING") + " Excluding schema " + yellowBright(defKey) + " due to match with " + redBright(bannedMatch));
				isNewLine = true;
				continue;
			}
		}

		nestedDefinitions[defKey]["$schema"] = "http://json-schema.org/draft-07/schema#";
		if (definitions[defKey]) {
			if (!deepEqual(definitions[defKey], nestedDefinitions[defKey])) {
				if (Object.keys(definitions[defKey]).every((k) => k === "$ref" || k === "$schema")) {
					definitions[defKey] = nestedDefinitions[defKey];
					console.log(yellowBright("\nWARNING"), "Overwriting definition for", defKey, "with nested definition (ref/schema only).");
					isNewLine = true;
				} else {
					console.log(redBright("\nERROR"), "Conflicting definition for", defKey, "found in main definitions.");
					console.log(columnizedObjectDiff(definitions[defKey], nestedDefinitions[defKey], true));
					console.log("Keys:", Object.keys(definitions[defKey]), Object.keys(nestedDefinitions[defKey]));
					isNewLine = true;
				}
			} else {
				// console.log("Definition", defKey, "is identical to existing definition, skipping.");
			}
		} else {
			definitions[defKey] = nestedDefinitions[defKey];
			if (isNewLine) {
				process.stdout.write("Adding nested definitions to main definitions: ");
				isNewLine = false;
			} else process.stdout.write("\x1b[4D, ");
			process.stdout.write(yellowBright(defKey) + "... ");
		}
	}

	deleteOneOfKindUndefinedRecursive(definitions, "$");

	if (process.env.WRITE_SCHEMA_DIR === "true") {
		await Promise.all(writePromises);
		await Promise.all(
			Object.keys(definitions).map(async (name) => {
				await fsp.writeFile(path.join("schemas_final", `${name}.json`), JSON.stringify(definitions[name], null, 4));
				// console.log("Wrote schema", name, "to schemas/");
			}),
		);
		await Promise.all(
			Object.keys(nestedDefinitions).map(async (name) => {
				await fsp.writeFile(path.join("schemas_nested", `${name}.json`), JSON.stringify(nestedDefinitions[name], null, 4));
				// console.log("Wrote schema", name, "to schemas_nested/");
			}),
		);
	}

	fs.writeFileSync(schemaPath, JSON.stringify(definitions, null, 4));
	fs.writeFileSync(__dirname + "/schemaExclusions.json", JSON.stringify(exclusionList, null, 4));
	console.log("\nSuccessfully wrote", Object.keys(definitions).length, "schemas to", schemaPath, "in", Number(totalSw.elapsed().totalMilliseconds + "." + totalSw.elapsed().microseconds), "ms,", fs.statSync(schemaPath).size, "bytes.");
}

function deleteOneOfKindUndefinedRecursive(obj, path) {
	if (obj?.type === "object" && obj?.properties?.oneofKind?.type === "undefined") return true;

	for (const key in obj) {
		if (typeof obj[key] === "object" && deleteOneOfKindUndefinedRecursive(obj[key], path + "." + key)) {
			console.log("Deleting", path, key);
			delete obj[key];
		}
	}

	return false;
}

function filterSchema(schema) {
	// this is a hack. we may want to check if its a @column instead
	if (schema.properties) {
		for (let key in schema.properties) {
			if (baseClassProperties.includes(key)) {
				delete schema.properties[key];
			}
		}
	}

	if (schema.required) schema.required = schema.required.filter((x) => !baseClassProperties.includes(x));

	// recurse into own definitions
	if (schema.definitions)
		for (const defKey in schema.definitions) {
			filterSchema(schema.definitions[defKey]);
		}
}

function deepEqual(a, b) {
	if (a === b) return true;

	if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
			return false;
		}
	}

	return true;
}

function columnizedObjectDiff(a, b, trackEqual = false) {
	const diffs = { left: {}, right: {}, ...(trackEqual ? { equal: {} } : {}) };
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	for (const key of keys) {
		if (!deepEqual(a[key], b[key])) {
			diffs.left[key] = a[key];
			diffs.right[key] = b[key];
		} else if (trackEqual) diffs.equal[key] = a[key];
	}
	return diffs;
}

main();
