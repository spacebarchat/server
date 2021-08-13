import fs from "fs";
import { MongoMemoryServer } from "mongodb-memory-server-global-4.4";
import path from "path";
import cluster from "cluster";
import os from "os";
import osu from "node-os-utils";
import exitHook from "async-exit-hook";

// TODO: add tcp socket event transmission
const cores = 1 || Number(process.env.threads) || os.cpus().length;

if (cluster.isMaster && !process.env.masterStarted) {
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

	process.env.masterStarted = "true";

	setInterval(async () => {
		const [cpuUsed, memory, network] = await Promise.all([osu.cpu.usage(), osu.mem.info(), osu.netstat.inOut()]);
		if (typeof network === "object") {
			console.log(`Network: in ${network.total.inputMb}mb | out ${network.total.outputMb}mb`);
		}

		console.log(
			`[CPU] ${cpuUsed.toFixed(2)}% | [Memory] ${memory.usedMemMb.toFixed(0)}mb/${memory.totalMemMb.toFixed(0)}mb`
		);
	}, 1000 * 60);

	(async () => {
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

		console.log(`[CPU] ${osu.cpu.model()} Cores x${osu.cpu.count()}`);
		console.log(`[System] ${await osu.os.oos()} ${os.arch()}`);
		console.log(`[Database] started`);
		console.log(`[Process] running with pid: ${process.pid}`);

		if (cores === 1) {
			require("./Server.js");
			return;
		}

		// Fork workers.
		for (let i = 0; i < cores; i++) {
			cluster.fork();
		}

		cluster.on("exit", (worker: any, code: any, signal: any) => {
			console.log(`[Worker] died with pid: ${worker.process.pid} , restarting ...`);
			cluster.fork();
		});
	})();
} else {
	require("./Server.js");
}
