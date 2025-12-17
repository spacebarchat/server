/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

const fs = require("fs");
const path = require("path");

let content = `/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) ${new Date().getFullYear()} Spacebar and Spacebar Contributors
	
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
`;

// node scripts/genIndex.js /path/to/dir
const targetDir = process.argv[2];
if (!targetDir) {
	console.error("Please provide a target directory.");
	process.exit(1);
}

if (fs.existsSync(path.join(targetDir, "index.js")) || fs.existsSync(path.join(targetDir, "index.ts"))) {
	console.error("index.js or index.ts already exists in the target directory.");
	process.exit(1);
}

const dirs = fs.readdirSync(targetDir).filter((f) => fs.statSync(path.join(targetDir, f)).isDirectory());
for (const dir of dirs) {
	content += `export * from "./${dir}";\n`;
}

const files = fs.readdirSync(targetDir).filter((f) => f.endsWith(".js") || f.endsWith(".ts"));
for (const file of files) {
	const filePath = path.join(targetDir, file);
	const stat = fs.statSync(filePath);
	if (stat.isFile()) {
		const ext = path.extname(file);
		const base = path.basename(file, ext);
		content += `export * from "./${base}";\n`;
	}
}

fs.writeFileSync(path.join(targetDir, "index.ts"), content);
