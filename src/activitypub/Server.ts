import { BodyParser, CORS, ErrorHandler } from "@spacebar/api";
import {
	Config,
	JSONReplacer,
	Sentry,
	initDatabase,
	registerRoutes,
	setupMorganLogging,
} from "@spacebar/util";
import bodyParser from "body-parser";
import { Request, Response, Router } from "express";
import { Server, ServerOptions } from "lambert-server";
import path from "path";
import wellknown from "./well-known";

export type SpacebarServerOptions = ServerOptions;

export class FederationServer extends Server {
	public declare options: SpacebarServerOptions;

	constructor(opts?: Partial<SpacebarServerOptions>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		super({ ...opts, errorHandler: false, jsonBody: false });
	}

	async start() {
		await initDatabase();
		await Config.init();
		await Sentry.init(this.app);

		setupMorganLogging(this.app);
		this.app.set("json replacer", JSONReplacer);

		this.app.use(CORS);
		this.app.use(
			BodyParser({
				inflate: true,
				limit: "10mb",
				type: "application/activity+json",
			}),
		);
		this.app.use(bodyParser.urlencoded({ extended: true }));

		const app = this.app;
		const api = Router();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.app = api;

		// TODO: auth
		// TODO: rate limits

		this.routes = await registerRoutes(
			this,
			path.join(__dirname, "routes", "/"),
		);

		api.use("*", (req: Request, res: Response) => {
			res.status(404).json({
				message: "404 endpoint not found",
				code: 0,
			});
		});

		this.app = app;

		this.app.use("/federation", api);
		this.app.use("/.well-known", wellknown);

		this.app.use(ErrorHandler);

		Sentry.errorHandler(this.app);

		return super.start();
	}
}
