/*
	Automatically appends our license preamble to each source file.
	Does not append if preamble already exists.
	Does not replace if change in util/licensePreamble.txt was made.
*/

const path = require("path");
const fs = require("fs");
const walk = require("./util/walk");

const FOSSCORD_SOURCE_DIR = path.join(__dirname, "..", "src");
const FOSSCORD_SCRIPTS_DIR = path.join(__dirname);
const FOSSCORD_LICENSE_PREAMBLE = fs
	.readFileSync(path.join(__dirname, "util", "licensePreamble.txt"))
	.toString()
	.split("\r") // remove windows bs
	.join("") // ^
	.split("\n")
	.map((x) => `\t${x}`)
	.join("\n");

const languageCommentStrings = {
	js: ["/*", "*/"],
	ts: ["/*", "*/"],
};

const addToDir = (dir) => {
	const files = walk(dir, Object.keys(languageCommentStrings));

	for (let path of files) {
		const file = fs.readFileSync(path).toString();
		const fileType = path.slice(path.lastIndexOf(".") + 1);
		const commentStrings = languageCommentStrings[fileType];
		if (!commentStrings) continue;

		const preamble =
			commentStrings[0] +
			"\n" +
			FOSSCORD_LICENSE_PREAMBLE +
			"\n" +
			commentStrings[1];

		if (file.startsWith(preamble)) {
			continue;
		}

		console.log(`writing to ${path}`);
		fs.writeFileSync(path, preamble + "\n\n" + file);
	}
};

addToDir(FOSSCORD_SOURCE_DIR);
addToDir(FOSSCORD_SCRIPTS_DIR);
