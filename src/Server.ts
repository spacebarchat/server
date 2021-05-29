import "missing-native-js-functions";
import fs from "fs/promises";
import { Connection } from "mongoose";
import { Server, ServerOptions } from "lambert-server";
import { Authentication, CORS, GlobalRateLimit } from "./middlewares/";
import { Config, db } from "@fosscord/server-util";
import i18next from "i18next";
import i18nextMiddleware, { I18next } from "i18next-http-middleware";
import i18nextBackend from "i18next-node-fs-backend";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import { BodyParser } from "./middlewares/BodyParser";
import express, { Router } from "express";
import fetch, { Response } from "node-fetch";
import mongoose from "mongoose";
import path from "path";

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

const assetCache = new Map<
	string,
	{
		response: Response;
		buffer: Buffer;
	}
>();

export class FosscordServer extends Server {
	public options: FosscordServerOptions;

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
			db.collection("invites").createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }) // after 0 seconds of expires_at the invite will get delete
		]);
	}

	async start() {
		// @ts-ignore
		await (db as Promise<Connection>);
		await this.setupSchema();
		console.log("[DB] connected");
		await Config.init();

		this.app.use(GlobalRateLimit);
		this.app.use(Authentication);
		this.app.use(CORS);
		this.app.use(BodyParser({ inflate: true }));
		const languages = await fs.readdir(path.join(__dirname, "..", "locales"));
		const namespaces = await fs.readdir(path.join(__dirname, "..", "locales", "en"));
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
		const prefix = Router();
		// @ts-ignore
		this.app = prefix;

		this.routes = await this.registerRoutes(path.join(__dirname, "routes", "/"));
		app.use("/api/v8", prefix);
		this.app = app;
		this.app.use(ErrorHandler);
		const indexHTML = await fs.readFile(path.join(__dirname, "..", "client_test", "index.html"), { encoding: "utf8" });

		this.app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

		this.app.get("/assets/:file", async (req, res) => {
			delete req.headers.host;
			var response: Response;
			var buffer: Buffer;
			const cache = assetCache.get(req.params.file);
			if (!cache) {
				response = await fetch(`https://discord.com/assets/${req.params.file}`, {
					// @ts-ignore
					headers: {
						...req.headers
					}
				});
				buffer = await response.buffer();
			} else {
				response = cache.response;
				buffer = cache.buffer;
			}

			response.headers.forEach((value, name) => {
				if (
					[
						"content-length",
						"content-security-policy",
						"strict-transport-security",
						"set-cookie",
						"transfer-encoding",
						"expect-ct",
						"access-control-allow-origin",
						"content-encoding"
					].includes(name.toLowerCase())
				) {
					return;
				}
				res.set(name, value);
			});
			assetCache.set(req.params.file, { buffer, response });

			return res.send(buffer);
		});
		this.app.get("*", (req, res) => {
			res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
			res.set("content-type", "text/html");
			res.send(
				indexHTML.replace(
					/CDN_HOST: ".+"/,
					`CDN_HOST: "${(Config.get().cdn.endpoint || "http://localhost:3003").replace(/https?:/, "")}"`
				)
			);
		});
		return super.start();
	}
}
