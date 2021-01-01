import express, { Application, Router } from "express";
import { traverseDirectory } from "./Utils";
import { Server as HTTPServer } from "http";
import fs from "fs/promises";

export type ServerOptions = {
	port: number;
};

export class Server {
	private app: Application;
	private http: HTTPServer;
	private options: ServerOptions;
	private routes: Router[];
	private initalized: Promise<any>;

	constructor(opts: ServerOptions = { port: 8080 }) {
		this.options = opts;

		this.app = express();

		this.initalized = this.init();
	}

	async init() {
		// recursively loads files in routes/
		this.routes = await this.registerRoutes(__dirname + "/routes/");
		// const indexHTML = await (await fetch("https://discord.com/app")).buffer();
		const indexHTML = await fs.readFile(__dirname + "/../client/index.html");

		this.app.get("*", (req, res) => {
			res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
			res.set("content-type", "text/html");
			res.send(indexHTML);
		});
	}

	async start() {
		await this.initalized;
		await new Promise<void>((res) => this.app.listen(this.options.port, () => res()));
		console.log(`[Server] started on ${this.options.port}`);
	}

	async registerRoutes(root: string) {
		return await traverseDirectory({ dirname: root, recursive: true }, this.registerRoute.bind(this, root));
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
			console.log(`[Server] Route ${path} registerd`);
			return router;
		} catch (error) {
			console.error(new Error(`[Server] Failed to register route ${path}: ${error}`));
		}
	}

	async stop() {
		return new Promise<void>((res) => this.http.close(() => res()));
	}
}
