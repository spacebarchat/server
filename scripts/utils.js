const path = require("path");
const fs = require("fs");
const { env } = require("process");
const { execSync } = require("child_process");
const { argv, stdout, exit } = require("process");

function copyRecursiveSync(src, dest) {
	//if (verbose) console.log(`cpsync: ${src} -> ${dest}`);
	let exists = fs.existsSync(src);
	if (!exists) {
		console.log(src + " doesn't exist, not copying!");
		return;
	}
	let stats = exists && fs.statSync(src);
	let isDirectory = exists && stats.isDirectory();
	if (isDirectory) {
		fs.mkdirSync(dest, { recursive: true });
		fs.readdirSync(src).forEach(function (childItemName) {
			copyRecursiveSync(
				path.join(src, childItemName),
				path.join(dest, childItemName)
			);
		});
	} else {
		fs.copyFileSync(src, dest);
	}
}

function execIn(cmd, workdir, opts) {
	try {
		return execSync(cmd, {
			cwd: workdir,
			shell: true,
			env: process.env,
			encoding: "utf-8",
			...opts
		});
	} catch (error) {
		return error.stdout;
	}
}

function getLines(output) {
	return output.split("\n").length;
}

function getDirs(dir) {
	return fs.readdirSync(dir).filter((x) => {
		try {
			fs.readdirSync(dir.join(dir, x));
			return true;
		} catch (e) {
			return false;
		}
	});
}

function walk(dir) {
	let results = [];
	let list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		let stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file));
		} else {
			results.push(file);
		}
	});
	return results;
}

function sanitizeVarName(str) {
	return str.replace('-','_').replace(/[^\w\s]/gi, '');
}

module.exports = { 
	//consts
	//functions
	copyRecursiveSync, execIn, getLines, getDirs, walk, sanitizeVarName
};
