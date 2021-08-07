import { Server, ServerOptions } from "lambert-server";
import { Config, db } from "@fosscord/server-util";
import path from "path";
import avatarsRoute from "./routes/avatars";

export interface CDNServerOptions extends ServerOptions {}

export class CDNServer extends Server {
	public options: CDNServerOptions;

	constructor(options?: Partial<CDNServerOptions>) {
		super(options);
	}

	async start() {
		console.log("[Database] connecting ...");
		// @ts-ignore
		await (db as Promise<Connection>);
		await Config.init();
		console.log("[Database] connected");
		this.app.use((req, res, next) => {
			res.set("Access-Control-Allow-Origin", "*");
			// TODO: use better CSP policy
			res.set(
				"Content-security-policy",
				"default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';"
			);
			res.set("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers") || "*");
			res.set("Access-Control-Allow-Methods", req.header("Access-Control-Request-Methods") || "*");
			next();
		});

		await this.registerRoutes(path.join(__dirname, "routes/"));

		this.app.use("/icons/", avatarsRoute);
		this.log("info", "[Server] Route /icons registered");

		this.app.use("/emojis/", avatarsRoute);
		this.log("info", "[Server] Route /emojis registered");

		this.app.use("/stickers/", avatarsRoute);
		this.log("info", "[Server] Route /stickers registered");

		this.app.use("/banners/", avatarsRoute);
		this.log("info", "[Server] Route /banners registered");
		
		this.app.use("/splashes/", avatarsRoute);
		this.log("info", "[Server] Route /splashes registered");

		this.app.use("/app-icons/", avatarsRoute);
		this.log("info", "[Server] Route /app-icons registered");

		this.app.use("/app-assets/", avatarsRoute);
		this.log("info", "[Server] Route /app-assets registered");

		this.app.use("/discover-splashes/", avatarsRoute);
		this.log("info", "[Server] Route /discover-splashes registered");

		this.app.use("/team-icons/", avatarsRoute);
		this.log("info", "[Server] Route /team-icons registered");

		return super.start();
	}

	async stop() {
		return super.stop();
	}
}
