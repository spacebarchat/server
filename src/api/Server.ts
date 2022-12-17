import "missing-native-js-functions";
import { Server, ServerOptions } from "lambert-server";
import { Authentication, CORS } from "./middlewares/";
import { Config, initDatabase, initEvent } from "@fosscord/util";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import { BodyParser } from "./middlewares/BodyParser";
import { Router, Request, Response, NextFunction } from "express";
import path from "path";
import { initRateLimits } from "./middlewares/RateLimit";
import TestClient from "./middlewares/TestClient";
import { initTranslation } from "./middlewares/Translation";
import morgan from "morgan";
import { initInstance } from "./util/handlers/Instance";
import { registerRoutes } from "@fosscord/util";
import { red } from "picocolors";

export interface FosscordServerOptions extends ServerOptions { }

declare global {
	namespace Express {
		interface Request {
			// @ts-ignore
			server: FosscordServer;
		}
	}
}

export class FosscordServer extends Server {
	public declare options: FosscordServerOptions;

	constructor(opts?: Partial<FosscordServerOptions>) {
		// @ts-ignore
		super({ ...opts, errorHandler: false, jsonBody: false });
	}

	async start() {
		await initDatabase();
		await Config.init();
		await initEvent();
		await initInstance();

		let logRequests = process.env["LOG_REQUESTS"] != undefined;
		if (logRequests) {
			this.app.use(
				morgan("combined", {
					skip: (req, res) => {
						var skip = !(
							process.env["LOG_REQUESTS"]?.includes(
								res.statusCode.toString(),
							) ?? false
						);
						if (process.env["LOG_REQUESTS"]?.charAt(0) == "-")
							skip = !skip;
						return skip;
					},
				}),
			);
		}

		this.app.use(CORS);
		this.app.use(BodyParser({ inflate: true, limit: "10mb" }));

		const app = this.app;
		const api = Router(); // @ts-ignore
		this.app = api;

		api.use(Authentication);
		await initRateLimits(api);
		await initTranslation(api);

		this.routes = await registerRoutes(
			this,
			path.join(__dirname, "routes", "/"),
		);

		// 404 is not an error in express, so this should not be an error middleware
		// this is a fine place to put the 404 handler because its after we register the routes
		// and since its not an error middleware, our error handler below still works.
		api.use(
			"*",
			(req: Request, res: Response, next: NextFunction) => {
				res.status(404).json({
					message: "404 endpoint not found",
					code: 0,
				});
			},
		);

		this.app = app;

		//app.use("/__development", )
		//app.use("/__internals", )
		app.use("/api/v6", api);
		app.use("/api/v7", api);
		app.use("/api/v8", api);
		app.use("/api/v9", api);
		app.use("/api", api); // allow unversioned requests

		this.app.use(ErrorHandler);
		TestClient(this.app);

		if (logRequests)
			console.log(
				red(
					`Warning: Request logging is enabled! This will spam your console!\nTo disable this, unset the 'LOG_REQUESTS' environment variable!`,
				),
			);

		return super.start();
	}
}
