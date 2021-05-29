import { Server, ServerOptions } from "lambert-server";
import { Config, db } from "@fosscord/server-util";
import path from "path";
import multerConfig from "multer";

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
		return super.start();
	}

	async stop() {
		return super.stop();
	}
}

export const multer = multerConfig({
	storage: multerConfig.memoryStorage(),
	limits: {
		fields: 10,
		files: 10,
		fileSize: 1024 * 1024 * 100, // 100 mb
	},
});
