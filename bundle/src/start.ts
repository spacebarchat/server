// process.env.MONGOMS_DEBUG = "true";
const tsConfigPaths = require("tsconfig-paths");
const path = require("path");
const baseUrl = path.join(__dirname, ".."); // Either absolute or relative path. If relative it's resolved to current working directory.
const cleanup = tsConfigPaths.register({
	baseUrl,
	paths: {
		"@fosscord/api": ["../api/dist/index.js"],
		"@fosscord/api/*": ["../api/dist/*"],
		"@fosscord/gateway": ["../gateway/dist/index.js"],
		"@fosscord/gateway/*": ["../gateway/dist/*"],
		"@fosscord/cdn": ["../cdn/dist/index.js"],
		"@fosscord/cdn/*": ["../cdn/dist/*"],
	},
});

import "reflect-metadata";
import cluster from "cluster";
import os from "os";
import { red, bold, yellow, cyan } from "nanocolors";
import { initStats } from "./stats";
import { config } from "dotenv";
config();
import { execSync } from "child_process";

// TODO: add tcp socket event transmission
const cores = 1 || Number(process.env.threads) || os.cpus().length;

export function getCommitOrFail() {
	try {
		return execSync("git rev-parse HEAD").toString().trim();
	} catch (e) {
		return null;
	}
}
const commit = getCommitOrFail();

console.log(
	bold(`
███████  ██████  ███████ ███████  ██████  ██████  ██████  ██████  
██      ██    ██ ██      ██      ██      ██    ██ ██   ██ ██   ██ 
█████   ██    ██ ███████ ███████ ██      ██    ██ ██████  ██   ██ 
██      ██    ██      ██      ██ ██      ██    ██ ██   ██ ██   ██ 
██       ██████  ███████ ███████  ██████  ██████  ██   ██ ██████  
           

		fosscord-server | ${yellow(
			`Pre-relase (${
				commit !== null
					? commit.slice(0, 7)
					: "Unknown (Git cannot be found)"
			})`
		)}

Current commit: ${
		commit !== null
			? `${cyan(commit)} (${yellow(commit.slice(0, 7))})`
			: "Unknown (Git cannot be found)"
	}
`)
);

if (commit == null)
	console.log(yellow(`Warning: Git is not installed or not in PATH.`));

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
				`[Worker] ${red(
					`died with pid: ${worker.process.pid} , restarting ...`
				)}`
			);
			cluster.fork();
		});
	})();
} else {
	require("./Server");
}
