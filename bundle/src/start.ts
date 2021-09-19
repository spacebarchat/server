// process.env.MONGOMS_DEBUG = "true";
import cluster from "cluster";
import os from "os";
import { initStats } from "./stats";

// TODO: add tcp socket event transmission
const cores = 1 || Number(process.env.threads) || os.cpus().length;

if (cluster.isMaster && !process.env.masterStarted) {
	process.env.masterStarted = "true";

	(async () => {
		initStats();

		if (cores === 1) {
			require("./Server");
			return;
		}

		// Fork workers.
		for (let i = 0; i < cores; i++) {
			cluster.fork();
		}

		cluster.on("exit", (worker: any, code: any, signal: any) => {
			console.log(
				`[Worker] died with pid: ${worker.process.pid} , restarting ...`
			);
			cluster.fork();
		});
	})();
} else {
	require("./Server");
}
