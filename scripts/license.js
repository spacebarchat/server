/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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
