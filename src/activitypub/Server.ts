import { BodyParser, CORS, ErrorHandler } from "@spacebar/api";
import {
	Config,
	JSONReplacer,
	initDatabase,
	registerRoutes,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { Server, ServerOptions } from "lambert-server";
import path from "path";
import webfinger from "./webfinger";

export class APServer extends Server {
	public declare options: ServerOptions;

	constructor(opts?: Partial<ServerOptions>) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		super({ ...opts, errorHandler: false, jsonBody: false });
	}

	async start() {
		await initDatabase();
		await Config.init();

		this.app.set("json replacer", JSONReplacer);

		this.app.use(CORS);
		this.app.use(BodyParser({ inflate: true, limit: "10mb" }));

		const api = Router();
		const app = this.app;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// lambert server is lame
		this.app = api;

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

		this.app.use("/fed", api);
		this.app.get("/fed", (req, res) => {
			res.json({ ping: "pong" });
		});

		this.app.use("/.well-known/webfinger", webfinger);

		this.app.use(ErrorHandler);

		return super.start();
	}
}
