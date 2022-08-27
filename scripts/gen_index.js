const path = require("path");
const fs = require("fs");
const { execIn, getLines, parts } = require("./utils");

if (!process.argv[2] || !fs.existsSync(process.argv[2])) {
	console.log("Please pass a directory that exists!");
	process.exit(1);
}
console.log(`// ${process.argv[2]}/index.ts`);
const recurse = process.argv.includes("--recursive");

const files = fs.readdirSync(process.argv[2]).filter((x) => x.endsWith(".ts") && x != "index.ts");

let output = "";

files.forEach((x) => (output += `export * from "./${x.replaceAll(".ts", "")}";\n`));

const dirs = fs.readdirSync(process.argv[2]).filter((x) => {
	try {
		fs.readdirSync(path.join(process.argv[2], x));
		return true;
	} catch (e) {
		return false;
	}
});
dirs.forEach((x) => {
	output += `export * from "./${x}/index";\n`;
});
console.log(output);
fs.writeFileSync(path.join(process.argv[2], "index.ts"), output);

dirs.forEach((x) => {
	if (recurse)
		console.log(
			execIn([process.argv[0], process.argv[1], `"${path.join(process.argv[2], x)}"`, "--recursive"].join(" "), process.cwd())
		);
});
