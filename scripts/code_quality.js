const path = require("path");
const fs = require("fs");
const { execIn, getLines, walk, projectRoot } = require("./utils");

let files = walk(path.join(projectRoot, "src"));
let _files = [];
files = files.map((x) => {
	_files[x.replace(path.resolve(path.join(__dirname, "..", "src")), "").replace("/", "")] = fs
		.readFileSync(x)
		.toString()
		.split("\n")
		.map((x) => x.replaceAll("\t", "    "));
});

let errors = 0,
	warnings = 0,
    todos = 0;
Object.keys(_files).forEach((x) => {
	let file = _files[x];
	file.forEach((line) => {
        let lineNum = file.indexOf(line)+1;
		if (/import {?.*}? from '.*'/.test(line)) {
			console.log(`[WARN] Inconsistent import syntax, please use double quotes! File: ${x}:${lineNum}`);
			warnings++;
		}
        if (/\/\/\s{0,3}TODO:/.test(line)) {
			console.log(`[TODO] Found a TODO in file ${x}:${lineNum}: ${line.split('TODO:')[1].trim()}`);
			todos++;
		}
        
	});
});

console.log(`\n${errors} errors, ${warnings} warnings, ${todos} TODOs`);

let loc = 0;
Object.values(_files).forEach((x) => {
	loc += x.length;
});
console.log("\nStats:\n");
console.log(`Lines of code: ${loc} lines in ${Object.values(_files).length} files.`);

debugger;
