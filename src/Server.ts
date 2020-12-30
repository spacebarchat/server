import express, { Application, Router, Request, Response, NextFunction } from "express";
import { MongoDatabase, Database } from "lambert-db";
import { Server as HTTPServer } from "http";
import { traverseDirectory } from "./Util";
import bodyParser from "body-parser";
import "express-async-errors";

const log = console.log;
console.log = (content) => {
	log(`[${new Date().toTimeString().split(" ")[0]}]`, content);
};

export type ServerOptions = {
	db: string;
	port: number;
	host: string;
};

declare global {
	namespace Express {
		interface Request {
			server: Server;
		}
	}
}

export class Server {
	app: Application;
	http: HTTPServer;
	db: Database;
	routes: Router[];
	options: ServerOptions;

	constructor(options: Partial<ServerOptions> = { port: 3000, host: "0.0.0.0" }) {
		this.app = express();
		this.db = new MongoDatabase(options?.db);
		this.options = options as ServerOptions;
	}

	async init() {
		await this.db.init();

		console.log("[Database] connected...");
		await new Promise((res, rej) => {
			this.http = this.app.listen(this.options.port, this.options.host, () => res(null));
		});
		this.routes = await this.registerRoutes(__dirname + "/routes/");
	}

	async registerRoutes(root: string) {
		this.app.use((req, res, next) => {
			req.server = this;
			next();
		});
		const routes = await traverseDirectory({ dirname: root, recursive: true }, this.registerRoute.bind(this, root));
		this.app.use((err: string | Error, req: Request, res: Response, next: NextFunction) => {
			res.status(400).send(err);
			next(err);
		});
		return routes;
	}

	registerRoute(root: string, file: string): any {
		if (root.endsWith("/") || root.endsWith("\\")) root = root.slice(0, -1); // removes slash at the end of the root dir
		let path = file.replace(root, ""); // remove root from path and
		path = path.split(".").slice(0, -1).join("."); // trancate .js/.ts file extension of path
		if (path.endsWith("/index")) path = path.slice(0, -6); // delete index from path

		try {
			var router = require(file);
			if (router.router) router = router.router;
			if (router.default) router = router.default;
			if (!router || router?.prototype?.constructor?.name !== "router")
				throw `File doesn't export any default router`;
			this.app.use(path, <Router>router);
			console.log(`[Routes] ${path} registerd`);

			return router;
		} catch (error) {
			console.error(new Error(`[Server] ¯\\_(ツ)_/¯ Failed to register route ${path}: ${error}`));
		}
	}

	async destroy() {
		await this.db.destroy();
		await new Promise((res, rej) => {
			this.http.close((err) => {
				if (err) return rej(err);
				return res("");
			});
		});
	}
}
