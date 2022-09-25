const path = require("path");
const fs = require("fs");
const parts = ["api", "util", "cdn", "gateway"];

const bundle = require("../package.json");

for (const part of parts) {
	const { devDependencies, dependencies } = require(path.join(
		"..",
		"..",
		part,
		"package.json"
	));
	bundle.devDependencies = { ...bundle.devDependencies, ...devDependencies };
	bundle.dependencies = { ...bundle.dependencies, ...dependencies };
	delete bundle.dependencies["@fosscord/util"];
}

fs.writeFileSync(
	path.join(__dirname, "..", "package.json"),
	JSON.stringify(bundle, null, "\t"),
	{ encoding: "utf8" }
);
