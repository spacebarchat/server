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

import morgan from "morgan";

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import * as Api from "@spacebar/api";
import * as Gateway from "@spacebar/gateway";
import * as Webrtc from "@spacebar/webrtc";
import { CDNServer } from "@spacebar/cdn";
import express from "express";
import { green, bold } from "picocolors";
import { Config, EnvConfig, initDatabase } from "@spacebar/util";

const app = express();
const server = http.createServer();
const port = Number(process.env.PORT) || 3001;
const wrtcWsPort = Number(process.env.WRTC_WS_PORT) || 3004;
const production = process.env.NODE_ENV == "development" ? false : true;
server.on("request", app);

const api = new Api.SpacebarServer({ server, port, production, app });
const cdn = new CDNServer({ server, port, production, app });
const gateway = new Gateway.Server({ server, port, production });
const webrtc = new Webrtc.Server({
	server: undefined,
	port: wrtcWsPort,
	production,
});

process.on("SIGTERM", async () => {
	console.log("Shutting down due to SIGTERM");
	await gateway.stop();
	await cdn.stop();
	await api.stop();
	await webrtc.stop();
	server.close();
});

async function main() {
	await initDatabase();
	await Config.init();

	const logRequests = EnvConfig.logging.logRequests != "";
	if (logRequests) {
		app.use(
			morgan("combined", {
				skip: (req, res) => {
					let skip = !(EnvConfig.logging.logRequests.includes(res.statusCode.toString()) ?? false);
					if (EnvConfig.logging.logRequests.charAt(0) == "-") skip = !skip;
					return skip;
				},
			}),
		);
	}

	await new Promise((resolve) => server.listen({ port }, () => resolve(undefined)));
	await Promise.all([api.start(), cdn.start(), gateway.start(), webrtc.start()]);

	console.log(`[Server] ${green(`Listening on port ${bold(port)}`)}`);
}

main().catch(console.error);
