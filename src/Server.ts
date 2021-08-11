import "missing-native-js-functions";
import fs from "fs";
import { Connection } from "mongoose";
import { Server, ServerOptions } from "lambert-server";
import { Authentication, CORS } from "./middlewares/";
import { Config, db } from "@fosscord/server-util";
import i18next from "i18next";
import i18nextMiddleware, { I18next } from "i18next-http-middleware";
import i18nextBackend from "i18next-node-fs-backend";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import { BodyParser } from "./middlewares/BodyParser";
import express, { Router, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import RateLimit from "./middlewares/RateLimit";
import TestClient from "./middlewares/TestClient";

// this will return the new updated document for findOneAndUpdate
mongoose.set("returnOriginal", false); // https://mongoosejs.com/docs/api/model.html#model_Model.findOneAndUpdate

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
		console.log("[Database] connected");
		await Config.init();

		this.app.use(CORS);
		this.app.use(Authentication);
		this.app.use(BodyParser({ inflate: true, limit: 1024 * 1024 * 10 })); // 2MB
		const languages = fs.readdirSync(path.join(__dirname, "..", "locales"));
		const namespaces = fs.readdirSync(path.join(__dirname, "..", "locales", "en"));
		const ns = namespaces.filter((x) => x.endsWith(".json")).map((x) => x.slice(0, x.length - 5));

		await i18next
			.use(i18nextBackend)
			.use(i18nextMiddleware.LanguageDetector)
			.init({
				preload: languages,
				// debug: true,
				fallbackLng: "en",
				ns,
				backend: {
					loadPath: __dirname + "/../locales/{{lng}}/{{ns}}.json"
				},
				load: "all"
			});
		this.app.use(i18nextMiddleware.handle(i18next, {}));

		const app = this.app;
		const api = Router();
		// @ts-ignore
		this.app = api;
		api.use(RateLimit({ bucket: "global", count: 10, window: 5, bot: 250 }));
		api.use(RateLimit({ bucket: "error", count: 5, error: true, window: 5, bot: 15, onlyIp: true }));
		api.use("/guilds/:id", RateLimit({ count: 5, window: 5 }));
		api.use("/webhooks/:id", RateLimit({ count: 5, window: 5 }));
		api.use("/channels/:id", RateLimit({ count: 5, window: 5 }));

		this.routes = await this.registerRoutes(path.join(__dirname, "routes", "/"));
		app.use("/api/v8", api);
		app.use("/api/v9", api);
		app.use("/api", api); // allow unversioned requests

		api.get("*", (req: Request, res: Response) => {
			res.status(404).json({
				message: "404: Not Found",
				code: 0
			});
		});

		this.app = app;
		this.app.use(ErrorHandler);
		TestClient(this.app);

		return super.start();
	}
}
