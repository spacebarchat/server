const { spawn } = require("child_process");
const path = require("path");
const { performance } = require("perf_hooks");

let parts = "util,api,cdn,gateway,bundle".split(",");

// because npm run is slow we directly get the build script of the package.json script

function buildPackage(dir) {
	const element = path.basename(dir);
	const swcBin = path.join(dir, "node_modules", "@swc", "cli", "lib", "swc", "index.js");

	const child = spawn("node", `${swcBin} src --out-dir dist --sync`.split(" "), {
		cwd: dir,
		env: process.env,
		shell: true,
	});
	function log(data) {
		console.log(`[${element}]`.padEnd(10, " ") + data.toString().slice(0, -1));
	}
	child.stdout.on("data", log);
	child.stderr.on("data", log);
	child.on("error", (err) => console.error(element, err));
	return child;
}

// util needs to be compiled first as the others require it

const start = performance.now();

for (const part of parts) {
	buildPackage(path.join(__dirname, "..", "..", part));
}

process.on("exit", () => {
	console.log("[Build]   took " + Math.round(performance.now() - start) + "ms");
});
