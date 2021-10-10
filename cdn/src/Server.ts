import { Server, ServerOptions } from "lambert-server";
import { Config, initDatabase, registerRoutes } from "@fosscord/util";
import path from "path";
import avatarsRoute from "./routes/avatars";
import bodyParser from "body-parser";

export interface CDNServerOptions extends ServerOptions {}

export class CDNServer extends Server {
	public declare options: CDNServerOptions;

	constructor(options?: Partial<CDNServerOptions>) {
		super(options);
	}

	async start() {
		await initDatabase();
		await Config.init();
		this.app.use((req, res, next) => {
			res.set("Access-Control-Allow-Origin", "*");
			// TODO: use better CSP policy
			res.set(
				"Content-security-policy",
				"default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';"
			);
			res.set(
				"Access-Control-Allow-Headers",
				req.header("Access-Control-Request-Headers") || "*"
			);
			res.set(
				"Access-Control-Allow-Methods",
				req.header("Access-Control-Request-Methods") || "*"
			);
			next();
		});
		this.app.use(bodyParser.json({ inflate: true, limit: "10mb" }));

		await registerRoutes(this, path.join(__dirname, "routes/"));

		this.app.use("/icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /icons registered");

		this.app.use("/emojis/", avatarsRoute);
		this.log("verbose", "[Server] Route /emojis registered");

		this.app.use("/stickers/", avatarsRoute);
		this.log("verbose", "[Server] Route /stickers registered");

		this.app.use("/banners/", avatarsRoute);
		this.log("verbose", "[Server] Route /banners registered");

		this.app.use("/splashes/", avatarsRoute);
		this.log("verbose", "[Server] Route /splashes registered");

		this.app.use("/app-icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /app-icons registered");

		this.app.use("/app-assets/", avatarsRoute);
		this.log("verbose", "[Server] Route /app-assets registered");

		this.app.use("/discover-splashes/", avatarsRoute);
		this.log("verbose", "[Server] Route /discover-splashes registered");

		this.app.use("/team-icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /team-icons registered");

		this.app.use("/channel-icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /channel-icons registered");

		return super.start();
	}

	async stop() {
		return super.stop();
	}
}
