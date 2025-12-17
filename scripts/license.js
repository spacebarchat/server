/*
	Automatically appends our license preamble to each source file.
	Does not prepend if preamble already exists.
	Does not replace if change in util/licensePreamble.txt was made.
	Does not prepend is file contains @fc-license-skip
*/

const Path = require("path");
const fs = require("fs");
const walk = require("./util/walk");

const SPACEBAR_SOURCE_DIR = Path.join(__dirname, "..", "src");
const SPACEBAR_SCRIPTS_DIR = Path.join(__dirname);
const SPACEBAR_LICENSE_PREAMBLE = fs
	.readFileSync(Path.join(__dirname, "util", "licensePreamble.txt"))
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
		const file = fs.readFileSync(path).toString().split("\r").join("");
		const fileType = path.slice(path.lastIndexOf(".") + 1);
		const commentStrings = languageCommentStrings[fileType];
		if (!commentStrings) continue;

		const preamble = commentStrings[0] + "\n" + SPACEBAR_LICENSE_PREAMBLE + "\n" + commentStrings[1];

		if (file.startsWith(preamble)) {
			continue;
		}

		// This is kind of lame.
		if (file.includes("@fc-license-skip") && path != __filename) {
			console.log(`skipping ${path} as it has a different license.`);
			continue;
		}

		console.log(`writing to ${path}`);
		fs.writeFileSync(path, preamble + "\n\n" + file);
	}
};

addToDir(SPACEBAR_SOURCE_DIR);
addToDir(SPACEBAR_SCRIPTS_DIR);
