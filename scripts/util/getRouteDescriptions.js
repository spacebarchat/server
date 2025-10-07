const express = require("express");
const path = require("path");
const { traverseDirectory } = require("lambert-server");
const RouteUtility = require("../../dist/api/util/handlers/route.js");

const methods = ["get", "post", "put", "delete", "patch"];
const routes = new Map();
let currentFile = "";
let currentPath = "";

/*
	For some reason, if a route exports multiple functions, it won't be registered here!
	If someone could fix that I'd really appreciate it, but for now just, don't do that :p
*/

/**
 * @param {string} file
 * @param {string} method
 * @param {string} prefix
 * @param {string} path
 * @param args
 */
function proxy(file, method, prefix, path, ...args) {
	const opts = args.find((x) => x?.prototype?.OPTS_MARKER == true);
	if (!opts)
		return console.error(
			`${file} has route without route() description middleware`,
		);

	console.log(`${method.toUpperCase().padStart("OPTIONS".length)} ${prefix + path}`);
	opts.file = file.replace("/dist/", "/src/").replace(".js", ".ts");
	routes.set(prefix + path + "|" + method, opts());
}

express.Router = () => {
	return Object.fromEntries(
		methods.map((method) => [
			method,
			proxy.bind(null, currentFile, method, currentPath),
		]),
	);
};

RouteUtility.route = (opts) => {
	const func = function () {
		return opts;
	};
	func.prototype.OPTS_MARKER = true;
	return func;
};

module.exports = function getRouteDescriptions() {
	const root = path.join(__dirname, "..", "..", "dist", "api", "routes", "/");
	traverseDirectory({ dirname: root, recursive: true }, (file) => {
		currentFile = file;

		currentPath = file.replace(root.slice(0, -1), "");
		currentPath = currentPath.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
		currentPath = currentPath.replaceAll("#", ":").replaceAll("\\", "/"); // replace # with : for path parameters and windows paths with slashes
		if (currentPath.endsWith("/index"))
			currentPath = currentPath.slice(0, "/index".length * -1); // delete index from path

		try {
			require(file);
		} catch (e) {
			console.error(e);
		}
	});

	return routes;
};
