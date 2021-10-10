import { Server, traverseDirectory } from "lambert-server";

const DEFAULT_FILTER = /^([^\.].*)(?<!\.d)\.(js)$/;

export function registerRoutes(server: Server, root: string) {
	return traverseDirectory(
		{ dirname: root, recursive: true, filter: DEFAULT_FILTER },
		server.registerRoute.bind(server, root)
	);
}
