import { traverseDirectory } from "lambert-server";
import path from "path";
import express from "express";
import * as RouteUtility from "../dist/util/route";
const Router = express.Router;

const routes = new Map<string, RouteUtility.RouteOptions>();
let currentPath = "";
let currentFile = "";
const methods = ["get", "post", "put", "delete", "patch"];

function registerPath(file, method, prefix, path, ...args) {
	const urlPath = prefix + path;
	const sourceFile = file.replace("/dist/", "/src/").replace(".js", ".ts");
	const opts = args.find((x) => typeof x === "object");
	if (opts) {
		routes.set(urlPath + "|" + method, opts);
		// console.log(method, urlPath, opts);
	} else {
		console.log(`${sourceFile}\nrouter.${method}("${path}") is missing the "route()" description middleware\n`, args);
	}
}

function routeOptions(opts) {
	return opts;
}

// @ts-ignore
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

export default function getRouteDescriptions() {
	const root = path.join(__dirname, "..", "dist", "routes", "/");
	traverseDirectory({ dirname: root, recursive: true }, (file) => {
		currentFile = file;
		let path = file.replace(root.slice(0, -1), "");
		path = path.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
		path = path.replaceAll("#", ":").replaceAll("\\", "/"); // replace # with : for path parameters and windows paths with slashes
		if (path.endsWith("/index")) path = path.slice(0, "/index".length * -1); // delete index from path
		currentPath = path;

		require(file);
	});
	return routes;
}
