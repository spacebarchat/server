import { MongoDatabase, Database } from "lambert-db";
import { Server, ServerOptions } from "lambert-server";

const log = console.log;
console.log = (content) => {
	log(`[${new Date().toTimeString().split(" ")[0]}]`, content);
};

declare global {
	namespace Express {
		interface Request {
			cdn: CDNServer;
		}
	}
}

export interface CDNServerOptions extends ServerOptions {
	db: string;
}

export class CDNServer extends Server {
	db: Database;
	public options: CDNServerOptions;

	constructor(options: CDNServerOptions) {
		super(options);

		this.db = new MongoDatabase(options?.db);
	}

	async start() {
		console.log("[Database] connecting ...");
		await this.db.init();
		console.log("[Database] connected");
		return super.start();
	}

	async stop() {
		await this.db.destroy();
		return super.stop();
	}
}
