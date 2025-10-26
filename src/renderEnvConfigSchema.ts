import { bgRedBright, dim, gray, white } from "picocolors";

require("dotenv").config({ quiet: true });
import moduleAlias from "module-alias";
moduleAlias();

import { initDatabase } from "@spacebar/util";
import { Config } from "@spacebar/util";
import { EnvConfig } from "@spacebar/util";

const schema = EnvConfig.schema();
const keyMap = [
	{
		name: "Name",
		selector: (v: {key: string}) => v.key
	},
	{
		name: "Value",
		selector: (v: {type: string}) => v.type
	},
	{
		name: "Description",
		selector: (v: {description: string}) => v.description
	}
];
// --- separators
const startOfLine = dim("| "); // <tr>
const endOfLine = "\n"; // </tr><br/>\n
const startOfCell = ""; // <td>
const endOfCell = dim(" | "); // </td><td>
const headSeparator = dim("-");
const pad = true;

// --- do not touch
const colWidths: {[key: string]: number} = {};

console.log(bgRedBright("Calculating column widths"));
for (const key of keyMap) {
	colWidths[key.name] = key.name.length;
}

for (const key of keyMap) {
	for (const entry of schema) {
		const len = key.selector(entry).toString().length;
		if (!colWidths[key.name] || len > colWidths[key.name]) {
			console.log(gray(`ColW ${key.name} ${colWidths[key.name] || 0} -> ${len} (entry: ${key.selector(entry)})`));
			colWidths[key.name] = len;
		}
	}
}

// --- render table
console.log(bgRedBright("Environment variables"));
process.stdout.write(startOfLine);
for (const key of keyMap) {
	const header = startOfCell + (pad ? key.name.padEnd(colWidths[key.name], " ") : key.name) + endOfCell;
	process.stdout.write(header);
}

process.stdout.write(endOfLine);
process.stdout.write(startOfLine);
for (const key of keyMap) {
	const separator = startOfCell + headSeparator.repeat(colWidths[key.name]) + endOfCell;
	process.stdout.write(separator);
}

process.stdout.write(endOfLine);
for (const entry of schema) {
	process.stdout.write(startOfLine);
	for (const key of keyMap) {
		const cell = startOfCell + (pad ? key.selector(entry).toString().padEnd(colWidths[key.name], " ") : key.selector(entry).toString()) + endOfCell;
		process.stdout.write(cell);
	}
	process.stdout.write(endOfLine);
}