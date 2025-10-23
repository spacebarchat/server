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

const scriptStartTime = new Date();

const conWarn = console.warn;
console.warn = (...args) => {
	// silence some expected warnings
	if (args[0] === "initializer is expression for property id") return;
	if (args[0].startsWith("unknown initializer for property ") && args[0].endsWith("[object Object]")) return;
	conWarn(...args);
};

const path = require("path");
const fs = require("fs");
const TJS = require("typescript-json-schema");
const walk = require("./util/walk");
const { redBright, yellowBright, bgRedBright, yellow } = require("picocolors");
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
			return true;
		}
	}
	return false;
}

function main() {
	const program = TJS.programFromConfig(path.join(__dirname, "..", "tsconfig.json"), walk(path.join(__dirname, "..", "src", "schemas")));
	const generator = TJS.buildGenerator(program, settings);
	if (!generator || !program) return;

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

	var definitions = {};

	if (process.env.WRITE_SCHEMA_DIR === "true") {
		fs.rmSync("schemas", { recursive: true, force: true });
		fs.mkdirSync("schemas");
	}

	for (const name of schemas) {
		const startTime = new Date();
		process.stdout.write(`Processing schema ${name}... `);
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

		if (definitions[name]) {
			process.stdout.write(yellow(` [ERROR] Duplicate schema name detected: ${name}. Overwriting previous schema.`));
		}

		if (!includesMatch(name, Included) && excludedLambdas.some((fn) => fn(name, part))) {
			continue;
		}

		if (process.env.WRITE_SCHEMA_DIR === "true") fs.writeFileSync(path.join("schemas", `${name}.json`), JSON.stringify(part, null, 4));

		process.stdout.write("Done in " + yellowBright(new Date() - startTime) + " ms, " + yellowBright(JSON.stringify(part).length) + " bytes (unformatted) ");
		if (new Date() - startTime >= 20) console.log(bgRedBright("[SLOW]"));
		else console.log();

		definitions = { ...definitions, [name]: { ...part } };
	}

	deleteOneOfKindUndefinedRecursive(definitions, "$");

	fs.writeFileSync(schemaPath, JSON.stringify(definitions, null, 4));
	fs.writeFileSync(__dirname + "/schemaExclusions.json", JSON.stringify(exclusionList, null, 4));
	console.log("Successfully wrote", Object.keys(definitions).length, "schemas to", schemaPath, "in", new Date() - scriptStartTime, "ms.");
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

main();
