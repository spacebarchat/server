/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

require("module-alias/register");

const express = require("express");
const path = require("path");
const { traverseDirectory } = require("lambert-server");
const RouteUtility = require("../../dist/api/middlewares/Route.js");
const { greenBright, yellowBright, blueBright, redBright, underline, bgYellow, black } = require("picocolors");

const methods = ["get", "post", "put", "delete", "patch"];
/**
 * @import { RouteOptions } from "../../src/api/middlewares/Route";
 */
/**
 * Discovered routes
 * @type {Map<string, RouteOptions>}
 */
const routes = new Map();
let currentFile = "";
let currentPath = "";
let currentRoutePrefix = "";

/*
	For some reason, if a route exports multiple functions, it won't be registered here!
	If someone could fix that I'd really appreciate it, but for now just, don't do that :p
*/

function colorizeMethod(method) {
    switch (method.toLowerCase()) {
        case "get":
            return greenBright(method.toUpperCase());
        case "post":
            return yellowBright(method.toUpperCase());
        case "put":
            return blueBright(method.toUpperCase());
        case "delete":
            return redBright(method.toUpperCase());
        case "patch":
            return yellowBright(method.toUpperCase());
        default:
            return method.toUpperCase();
    }
}

function formatPath(path) {
    return path.replace(/:(\w+)/g, underline(":$1")).replace(/#(\w+)/g, underline("#$1"));
}

/**
 * @param {string} file
 * @param {string} apiMethod
 * @param {string} apiPathPrefix
 * @param {string} apiPath
 * @param args
 */
function proxy(file, apiMethod, apiPathPrefix, apiPath, ...args) {
    const opts = args.find((x) => x?.prototype?.OPTS_MARKER == true);
    if (!opts) {
        console.error(
            `  \x1b[5m${bgYellow(black("WARN"))}\x1b[25m ${file.replace(path.resolve(__dirname, "..", "..", "dist"), "/src")} has route without route() description middleware: ${colorizeMethod(apiMethod)} ${formatPath(apiPath)}`,
        );
        routes.set(apiPathPrefix + apiPath + "|" + apiMethod, null);
        return;
    }

    console.log(`${colorizeMethod(apiMethod).padStart("DELETE".length + 10)} ${formatPath(apiPathPrefix + apiPath)}`);
    opts.file = file.replace("/dist/", "/src/").replace(".js", ".ts");
    routes.set(currentRoutePrefix + apiPathPrefix + apiPath + "|" + apiMethod, opts());
}

express.Router = () => {
    return Object.fromEntries(methods.map((method) => [method, proxy.bind(null, currentFile, method, currentPath)]));
};

RouteUtility.route = (opts) => {
    const func = function () {
        return opts;
    };
    func.prototype.OPTS_MARKER = true;
    return func;
};

function getPrefixedRouteDescriptions(routePrefix, root) {
    currentRoutePrefix = routePrefix;
    traverseDirectory({ dirname: root, recursive: true }, (file) => {
        currentFile = file;

        currentPath = file.replace(root.slice(0, -1), "");
        currentPath = currentPath.split(".").slice(0, -1).join("."); // truncate .js/.ts file extension of path
        currentPath = currentPath.replaceAll("#", ":").replaceAll("\\", "/"); // replace # with : for path parameters and windows paths with slashes
        currentPath = currentPath.replaceAll(/%[A-Za-z0-9]{2}/g, (match) => decodeURIComponent(match)); // special case to handle .well-known for example
        if (currentPath.endsWith("/index")) currentPath = currentPath.slice(0, "/index".length * -1); // delete index from path

        try {
            require(file);
        } catch (e) {
            console.error(e);
        }
    });
}

module.exports = function getRouteDescriptions() {
    getPrefixedRouteDescriptions("/api", path.join(__dirname, "..", "..", "dist", "api", "routes", "/"));
    getPrefixedRouteDescriptions("", path.join(__dirname, "..", "..", "dist", "api", "routes_toplevel", "/"));

    return routes;
};
