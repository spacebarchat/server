const { spawn } = require("child_process");
const path = require("path");
const { performance } = require("perf_hooks");
const fs = require("fs");
const esbuildPluginTsc = require("esbuild-plugin-tsc");

let parts = "api,cdn,gateway,bundle".split(",");
const tscBin = path.join(__dirname, "..", "..", "util", "node_modules", "typescript", "bin", "tsc");
const swcBin = path.join(__dirname, "..", "..", "util", "node_modules", "@swc", "cli", "bin", "swc");

// because npm run is slow we directly get the build script of the package.json script

function buildPackage(dir) {
	const element = path.basename(dir);

	require("esbuild").build({
		entryPoints: walk(path.join(dir, "src")),
		bundle: false,
		outdir: path.join(dir, "dist"),
		target: "es2021",
		format: "cjs",
		plugins: [esbuildPluginTsc({})],
		keepNames: true,
	});
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
console.log("[Build] starting ...");

util();
for (const part of parts) {
	buildPackage(path.join(__dirname, "..", "..", part));
}

process.on("exit", () => {
	console.log("[Build] took " + Math.round(performance.now() - start) + "ms");
});

function walk(dir) {
	var results = [];
	var list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file));
		} else if (file.endsWith(".ts")) {
			/* Is a file */
			results.push(file);
		}
	});
	return results;
}
