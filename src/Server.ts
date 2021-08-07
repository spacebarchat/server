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

		await this.registerRoutes(path.join(__dirname, "routes/"));

		this.app.use("/icons/", avatarsRoute);
		this.log("info", "[Server] Route /icons registered");

		this.app.use("/emojis/", avatarsRoute);
		this.log("info", "[Server] Route /emojis registered");

		this.app.use("/banners/", avatarsRoute);
		this.log("info", "[Server] Route /banners registered");

		this.app.use("/banners/", avatarsRoute);
		this.log("info", "[Server] Route /banners registered");

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
