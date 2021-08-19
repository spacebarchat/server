import fs from "fs";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import exitHook from "async-exit-hook";

if (process.arch == "ia32") {
	Object.defineProperty(process, "arch", {
		value: "x64",
	});
}

export async function setupDatabase() {
	if (process.env.MONGO_URL) return; // exit because the user provides his own mongodb
	const dbPath = path.join(__dirname, "..", "..", "db");
	const dbName = "fosscord";
	const storageEngine = "wiredTiger";
	const port = 27020;
	const ip = "127.0.0.1";
	var mongod: MongoMemoryServer;
	fs.mkdirSync(dbPath, { recursive: true });

	exitHook((callback: any) => {
		(async () => {
			console.log(`Stopping MongoDB ...`);
			await mongod.stop();
			console.log(`Stopped MongoDB`);
			callback();
		})();
	});

	console.log(`[Database] starting ...`);
	mongod = new MongoMemoryServer({
		instance: {
			port,
			ip,
			dbName,
			dbPath,
			storageEngine,
			auth: false, // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
		},
	});
	await mongod.start();
	process.env.MONGO_URL = mongod.getUri(dbName);
}
