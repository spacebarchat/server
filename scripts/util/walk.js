const fs = require("fs");

/** dir: string. types: string[] ( file types ) */
module.exports = function walk(dir, types = ["ts"]) {
	var results = [];
	var list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file, types));
		} else {
			if (!types.find((x) => file.endsWith(x))) return;
			results.push(file);
		}
	});
	return results;
};
