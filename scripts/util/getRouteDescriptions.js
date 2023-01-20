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

const { traverseDirectory } = require("lambert-server");
const path = require("path");
const express = require("express");
const RouteUtility = require("../../dist/api/util/handlers/route.js");
const Router = express.Router;

const routes = new Map();
let currentPath = "";
let currentFile = "";
const methods = ["get", "post", "put", "delete", "patch"];

function registerPath(file, method, prefix, path, ...args) {
	const urlPath = prefix + path;
	const sourceFile = file.replace("/dist/", "/src/").replace(".js", ".ts");
	const opts = args.find((x) => typeof x === "object");
	if (opts) {
		routes.set(urlPath + "|" + method, opts);
		opts.file = sourceFile;
		// console.log(method, urlPath, opts);
	} else {
		console.log(
			`${sourceFile}\nrouter.${method}("${path}") is missing the "route()" description middleware\n`,
		);
	}
}

function routeOptions(opts) {
	return opts;
}

RouteUtility.route = routeOptions;

express.Router = (opts) => {
	const path = currentPath;
	const file = currentFile;
	const router = Router(opts);

	for (const method of methods) {
		router[method] = registerPath.bind(null, file, method, path);
	}

	return router;
};

module.exports = function getRouteDescriptions() {
	const root = path.join(__dirname, "..", "..", "dist", "api", "routes", "/");
	traverseDirectory({ dirname: root, recursive: true }, (file) => {
		currentFile = file;
		let path = file.replace(root.slice(0, -1), "");
		path = path.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
		path = path.replaceAll("#", ":").replaceAll("\\", "/"); // replace # with : for path parameters and windows paths with slashes
		if (path.endsWith("/index")) path = path.slice(0, "/index".length * -1); // delete index from path
		currentPath = path;

		try {
			require(file);
		} catch (error) {
			console.error("error loading file " + file, error);
		}
	});
	return routes;
};
