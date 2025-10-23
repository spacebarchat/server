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

import moduleAlias from "module-alias";
moduleAlias(__dirname + "../../../package.json");
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import { config } from "dotenv";
config({ quiet: true });
import { SpacebarServer } from "./Server";
import cluster from "cluster";
import { EnvConfig } from "@spacebar/util";

if (cluster.isPrimary && process.env.NODE_ENV == "production") {
	console.log(`Primary PID: ${process.pid}`);

	// Fork workers.
	for (let i = 0; i < EnvConfig.get().threads; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker) => {
		console.log(`Worker ${worker.process.pid} died, restarting worker`);
		cluster.fork();
	});
} else {
	const port = EnvConfig.get().port || 3001;

	const server = new SpacebarServer({ port });
	server.start().catch(console.error);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	global.server = server;
}
