const path = require("path");
const fs = require("fs").promises;
const { execIn, getLines, walk, projectRoot } = require("./utils");

let printTodos = process.argv.includes("TODOS");

let root = path.resolve(path.join(__dirname, "..", "src"));
let files = walk(root);
let _files = [];
let errors = 0,
	warnings = 0,
	todos = 0;

Promise.all(files.map(getFile)).then((f) => {
	Promise.all(Object.keys(_files).map(checkFile));
	console.log(`\n${errors} errors, ${warnings} warnings, ${todos} TODOs.`);

	let loc = 0;
	Object.values(_files).forEach((x) => {
		loc += x.length;
	});
	console.log("\nStats:\n");
	console.log(`Lines of code: ${loc} lines in ${Object.values(_files).length} files.`);

	debugger;
});

async function getFile(name) {
	let contents = (await fs.readFile(name)).toString().split("\n");
	_files[name] = contents;
}

async function checkFile(x) {
	_files[x].forEach((line) => scanLine(x, line));
}

function log(file, line, msg) {
	let lineNum = _files[file].indexOf(line) + 1;
	console.log(msg, "File:", file.replace(root + "/", "") + ":" + lineNum);
}

function scanLine(x, line) {
	if (/import/.test(line)) {
		if (/import {?.*}? from '.*'/.test(line)) {
			log(x, line, `[WARN] Inconsistent import syntax, please use double quotes!`);
			warnings++;
		}
	} else {
		if (line.trim().endsWith("TODO:")) {
			log(x, line, `[ERRO] Empty TODO!`);
			errors++;
		} else if (/\/\/\s{0,3}TODO:/.test(line)) {
			if (printTodos) log(x, line, `[TODO] Found a TODO: ${line.split("TODO:")[1].trim()}.`);
			todos++;
		}
		if (/(:|=)/.test(line)) {
			if (/(:|=) {2,}/.test(line)) {
				log(x, line, `[WARN] Multiple spaces in assignment!`);
				warnings++;
			}
			if (/(:|=)\t'/.test(line)) {
				log(x, line, `[WARN] Tab in assignment!`);
				warnings++;
			}
			if (/(:|=)\w'/.test(line)) {
				log(x, line, `[WARN] Missing space in assignment!`);
				warnings++;
			}
			if (/(:|=) undefined/.test(line) && !/(:|=){2,} undefined/.test(line)) {
				log(x, line, `[WARN] Use of undefined!`);
				warnings++;
			}
		}
	}
}
