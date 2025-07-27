/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// process.env.MONGOMS_DEBUG = "true";
import moduleAlias from "module-alias";

moduleAlias(__dirname + "../../../package.json");

import "reflect-metadata";
import cluster, { Worker } from "cluster";
import os from "os";
import { red, bold, yellow, cyan, blueBright, redBright } from "picocolors";
import { initStats } from "./stats";
import { config } from "dotenv";

config();
import { execSync } from "child_process";
import { centerString, Logo } from "@spacebar/util";

const cores = process.env.THREADS ? parseInt(process.env.THREADS) : 1;

function getCommitOrFail() {
	try {
		return execSync("git rev-parse HEAD").toString().trim();
	} catch (e) {
		return null;
	}
}

if (cluster.isPrimary) {
	const commit = getCommitOrFail();
	// Logo.printLogo();
	const unformatted = `spacebar-server | ! Pre-release build !`;
	const formatted = `${blueBright("spacebar-server")} | ${redBright("⚠️ Pre-release build ⚠️")}`;
	console.log(
		bold(centerString(unformatted, 64).replace(unformatted, formatted)),
	);

	const unformattedGitHeader = `Commit Hash: ${commit !== null ? commit : "Unknown (Git cannot be found)"}`;
	const formattedGitHeader = `Commit Hash: ${commit !== null ? `${cyan(commit)} (${yellow(commit.slice(0, 7))})` : "Unknown (Git cannot be found)"}`;
	console.log(
		bold(
			centerString(unformattedGitHeader, 64).replace(
				unformattedGitHeader,
				formattedGitHeader,
			),
		),
	);
	console.log(`Cores: ${cyan(os.cpus().length)} (Using ${cores} thread(s).)`);

	if (commit == null) {
		console.log(yellow(`Warning: Git is not installed or not in PATH.`));
	}

	initStats();

	console.log(`[Process] Starting with ${cores} threads`);

	if (cores === 1) {
		require("./Server");
	} else {
		process.env.EVENT_TRANSMISSION = "process";

		// Fork workers.
		for (let i = 0; i < cores; i++) {
			// Delay each worker start if using sqlite database to prevent locking it
			const delay = process.env.DATABASE?.includes("://") ? 0 : i * 1000;
			setTimeout(() => {
				cluster.fork();
				console.log(`[Process] Worker ${cyan(i)} started.`);
			}, delay);
		}

		cluster.on("message", (sender: Worker, message) => {
			for (const id in cluster.workers) {
				const worker = cluster.workers[id];
				if (worker === sender || !worker) continue;
				worker.send(message);
			}
		});

		cluster.on("exit", (worker) => {
			console.log(
				`[Worker] ${red(
					`PID ${worker.process.pid} died, restarting ...`,
				)}`,
			);
			cluster.fork();
		});
	}
} else {
	require("./Server");
}
