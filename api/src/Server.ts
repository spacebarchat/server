import "missing-native-js-functions";
import { Connection } from "mongoose";
import { Server, ServerOptions } from "lambert-server";
import { Authentication, CORS } from "./middlewares/";
import { Config, db, initEvent } from "@fosscord/util";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import { BodyParser } from "./middlewares/BodyParser";
import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import path from "path";
import { initRateLimits } from "./middlewares/RateLimit";
import TestClient from "./middlewares/TestClient";
import { initTranslation } from "./middlewares/Translation";

export interface FosscordServerOptions extends ServerOptions {}

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

	async setupSchema() {
		return Promise.all([
			db.collection("users").createIndex({ id: 1 }, { unique: true }),
			db.collection("messages").createIndex({ id: 1 }, { unique: true }),
			db.collection("channels").createIndex({ id: 1 }, { unique: true }),
			db.collection("guilds").createIndex({ id: 1 }, { unique: true }),
			db.collection("members").createIndex({ id: 1, guild_id: 1 }, { unique: true }),
			db.collection("roles").createIndex({ id: 1 }, { unique: true }),
			db.collection("emojis").createIndex({ id: 1 }, { unique: true }),
			db.collection("invites").createIndex({ code: 1 }, { unique: true }),
			db.collection("invites").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }), // after 0 seconds of expires_at the invite will get delete
			db.collection("ratelimits").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
		]);
	}

	async start() {
		// @ts-ignore
		await (db as Promise<Connection>);
		await this.setupSchema();
		await Config.init();
		await initEvent();

		this.app.use(CORS);
		this.app.use(BodyParser({ inflate: true, limit: 1024 * 1024 * 10 })); // 2MB

		const app = this.app;
		const api = Router(); // @ts-ignore
		this.app = api;

		api.use(Authentication);
		await initRateLimits(api);
		await initTranslation(api);

		this.routes = await this.registerRoutes(path.join(__dirname, "routes", "/"));

		api.use("*", (error: any, req: Request, res: Response, next: NextFunction) => {
			if (error) return next(error);
			res.status(404).json({
				message: "404: Not Found",
				code: 0
			});
			next();
		});

		this.app = app;
		app.use("/api/v8", api);
		app.use("/api/v9", api);
		app.use("/api", api); // allow unversioned requests
		this.app.use(ErrorHandler);
		TestClient(this.app);

		return super.start();
	}
}
