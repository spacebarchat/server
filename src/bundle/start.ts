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

config({ quiet: true });
import { execSync } from "child_process";
import { centerString, EnvConfig, Logo } from "@spacebar/util";
import fs from "fs";
import path from "path";

const cores = EnvConfig.threads;

function getRevInfoOrFail(): { rev: string | null; lastModified: number } {
	const rootDir = path.join(__dirname, "../../");
	// sanity check
	if (!fs.existsSync(path.join(rootDir, "package.json"))) {
		console.log(red("Error: Cannot find package.json in root directory. Are you running from the correct location?"));
	}

	// use .rev file if it exists
	if (fs.existsSync(path.join(__dirname, "../../.rev"))) {
		return JSON.parse(fs.readFileSync(path.join(rootDir, ".rev"), "utf-8"));
	}

	// fall back to invoking git
	try {
		const rev = execSync(`git -C "${rootDir}" rev-parse HEAD`).toString().trim();
		const lastModified = Number(execSync(`git -C "${rootDir}" log -1 --format=%cd --date=unix`).toString().trim());
		return {
			rev,
			lastModified,
		};
	} catch (e) {
		return { rev: null, lastModified: 0 };
	}
}

if (cluster.isPrimary) {
	const revInfo = getRevInfoOrFail();
	Logo.printLogo().then(() => {
		const unformatted = `spacebar-server | !! Pre-release build !!`;
		const formatted = `${blueBright("spacebar-server")} | ${redBright("⚠️ Pre-release build ⚠️")}`;
		console.log(bold(centerString(unformatted, 86).replace(unformatted, formatted)));

		const shortRev = revInfo.rev ? revInfo.rev.slice(0, 7) : "unknown";
		const unformattedRevisionHeader = `Commit Hash: ${revInfo.rev !== null ? `${revInfo.rev} (${shortRev})` : "Unknown"}`;
		const formattedRevisionHeader = `Commit Hash: ${revInfo.rev !== null ? `${cyan(revInfo.rev)} (${yellow(shortRev)})` : "Unknown"}`;
		console.log(bold(centerString(unformattedRevisionHeader, 86).replace(unformattedRevisionHeader, formattedRevisionHeader)));

		const modifiedTime = new Date(revInfo.lastModified * 1000);
		const unformattedLastModified = `Last Updated: ${revInfo.lastModified !== 0 ? `${modifiedTime.toUTCString()}` : "Unknown"}`;
		const formattedLastModified = `Last Updated: ${revInfo.lastModified !== 0 ? `${cyan(modifiedTime.toUTCString())}` : "Unknown"}`;
		console.log(bold(centerString(unformattedLastModified, 86).replace(unformattedLastModified, formattedLastModified)));

		if (revInfo.rev == null) {
			console.log(yellow(`Warning: Git is not installed or not in PATH, or the server is not running from a Git repository.`));
		}

		console.log(`Cores: ${cyan(os.cpus().length)} (Using ${cores} thread(s).)`);
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
				console.log(`[Worker] ${red(`PID ${worker.process.pid} died, restarting ...`)}`);
				cluster.fork();
			});
		}
	});
} else {
	require("./Server");
}
