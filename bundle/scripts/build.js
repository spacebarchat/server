const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { performance } = require("perf_hooks");

let parts = "api,cdn,gateway,bundle".split(",");
const tscBin = path.join(__dirname, "..", "..", "util", "node_modules", "typescript", "bin", "tsc");
const swcBin = path.join(__dirname, "..", "..", "util", "node_modules", "@swc", "cli", "bin", "swc");

// because npm run is slow we directly get the build script of the package.json script

function buildPackage(dir) {
	const element = path.basename(dir);

	return require("esbuild").build({
		entryPoints: walk(path.join(dir, "src")),
		bundle: false,
		outdir: path.join(dir, "dist"),
		target: "es2021",
		// plugins don't really work because bundle is false
		keepNames: false,
		tsconfig: path.join(dir, "tsconfig.json"),
	});
}

const importPart = /import (\* as )?(({[^}]+})|(\w+)) from ("[.\w-/@q]+")/g;
const importMod = /import ("[\w-/@q.]+")/g;
const exportDefault = /export default/g;
const exportAllAs = /export \* from (".+")/g;
const exportMod = /export ({[\w, ]+})/g;
const exportConst = /export (const|var|let) (\w+)/g;
const exportPart = /export ((async )?\w+) (\w+)/g;

// resolves tsconfig paths + rewrites es6 imports/exports to require (because esbuild/swc doesn't work properly)
function transpileFiles() {
	for (const part of ["gateway", "api", "cdn", "bundle"]) {
		const files = walk(path.join(__dirname, "..", "..", part, "dist"));
		for (const file of files) {
			let content = fs.readFileSync(file, { encoding: "utf8" });
			content = content
				.replace(
					new RegExp(`@fosscord/${part}`),
					path.relative(file, path.join(__dirname, "..", "..", part, "dist")).slice(3)
				)
				.replace(importPart, `const $2 = require($5)`)
				.replace(importMod, `require($1)`)
				.replace(exportDefault, `module.exports =`)
				.replace(exportAllAs, `module.exports = {...(module.exports)||{}, ...require($1)}`)
				.replace(exportMod, "module.exports = $1")
				.replace(exportConst, `let $2 = {};\nmodule.exports.$2 = $2`)
				.replace(exportPart, `module.exports.$3 = $1 $3`);
			fs.writeFileSync(file, content);
		}
	}
}

function util() {
	// const child = spawn("node", `${swcBin}  src --out-dir dist --sync`.split(" "), {
	const child = spawn("node", `${tscBin} -b .`.split(" "), {
		cwd: path.join(__dirname, "..", "..", "util"),
		env: process.env,
		shell: true,
	});
	function log(data) {
		console.log(`[util] ` + data.toString().slice(0, -1));
	}
	child.stdout.on("data", log);
	child.stderr.on("data", log);
	child.on("error", (err) => console.error("util", err));
	return child;
}

const start = performance.now();

async function main() {
	console.log("[Build] starting ...");
	util();
	await Promise.all(parts.map((part) => buildPackage(path.join(__dirname, "..", "..", part))));
	transpileFiles();
}

main();

process.on("exit", () => {
	console.log("[Build] took " + Math.round(performance.now() - start) + "ms");
});

function walk(dir) {
	var results = [];
	var list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = path.join(dir, file);
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file));
		} else if (file.endsWith(".ts") || file.endsWith(".js")) {
			/* Is a file */
			results.push(file);
		}
	});
	return results;
}
