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

import { Server } from "./Server";
import { config } from "dotenv";
import fs from "fs";
import cluster from "cluster";
config({ quiet: true });

let port = Number(process.env.PORT);
if (isNaN(port)) port = 3002;

const server = new Server({
    port,
});

if (fs.existsSync("/proc/self/comm")) fs.writeFileSync("/proc/self/comm", `spacebar-gw-${cluster.worker ? cluster.worker.id : port}`);
process.title = `sb-gw-${cluster.worker ? cluster.worker.id : port}`;

server.start();
