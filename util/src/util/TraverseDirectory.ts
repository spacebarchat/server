import { Server, traverseDirectory } from "lambert-server";

//if we're using ts-node, use ts files instead of js
const extension = Symbol.for("ts-node.register.instance") in process ? "ts" : "js"

const DEFAULT_FILTER = new RegExp("^([^\.].*)(?<!\.d)\.(" + extension + ")$");

export function registerRoutes(server: Server, root: string) {
	return traverseDirectory(
		{ dirname: root, recursive: true, filter: DEFAULT_FILTER },
		server.registerRoute.bind(server, root)
	);
}
