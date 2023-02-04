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

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import * as Api from "@fosscord/api";
import * as Gateway from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn";
import * as Webrtc from "@fosscord/webrtc";
import express from "express";
import { green, bold } from "picocolors";
import { Config, initDatabase, Sentry } from "@fosscord/util";

const app = express();
const server = http.createServer();
const port = Number(process.env.PORT) || 3001;
const production = process.env.NODE_ENV == "development" ? false : true;
server.on("request", app);

const api = new Api.FosscordServer({ server, port, production, app });
const cdn = new CDNServer({ server, port, production, app });
const gateway = new Gateway.Server({ server, port, production });
const webrtc = new Webrtc.Server({ port: 3004, production });

process.on("SIGTERM", async () => {
	console.log("Shutting down due to SIGTERM");
	await gateway.stop();
	await cdn.stop();
	await api.stop();
	await webrtc.stop();
	server.close();
	Sentry.close();
});

async function main() {
	await initDatabase();
	await Config.init();
	await Sentry.init(app);

	server.listen(port);
	await Promise.all([
		api.start(),
		cdn.start(),
		gateway.start(),
		webrtc.start(),
	]);

	Sentry.errorHandler(app);

	console.log(`[Server] ${green(`listening on port ${bold(port)}`)}`);
}

main().catch(console.error);
