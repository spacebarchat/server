/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

require("module-alias/register");
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import "missing-native-js-functions";
import { config } from "dotenv";
config();
import { FosscordServer } from "./Server";
import cluster from "cluster";
import os from "os";
var cores = 1;
try {
	cores = Number(process.env.THREADS) || os.cpus().length;
} catch {
	console.log("[API] Failed to get thread count! Using 1...");
}

if (cluster.isPrimary && process.env.NODE_ENV == "production") {
	console.log(`Primary ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < cores; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died, restart worker`);
		cluster.fork();
	});
} else {
	var port = Number(process.env.PORT) || 3001;

	const server = new FosscordServer({ port });
	server.start().catch(console.error);

	// @ts-ignore
	global.server = server;
}
