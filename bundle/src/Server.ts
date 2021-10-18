process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import * as Api from "@fosscord/api";
import * as Gateway from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn";
import express from "express";
import { green, bold } from "nanocolors";
import { Config, initDatabase } from "@fosscord/util";

const app = express();
const server = http.createServer();
const port = Number(process.env.PORT) || 3001;
const production = process.env.NODE_ENV == "development" ? false : true;
server.on("request", app);

// @ts-ignore
const api = new Api.FosscordServer({ server, port, production, app });
// @ts-ignore
const cdn = new CDNServer({ server, port, production, app });
// @ts-ignore
const gateway = new Gateway.Server({ server, port, production });

async function main() {
	server.listen(port);
	await initDatabase();
	await Config.init();
	// only set endpointPublic, if not already set
	await Config.set({
		cdn: {
			endpointClient: "${location.host}",
			endpointPrivate: `http://localhost:${port}`,
		},
		gateway: {
			endpointClient:
				'${location.protocol === "https:" ? "wss://" : "ws://"}${location.host}',
			endpointPrivate: `ws://localhost:${port}`,
			...(!Config.get().gateway.endpointPublic && {
				endpointPublic: `ws://localhost:${port}`,
			}),
		},
		// regions: {
		// 	default: "fosscord",
		// 	useDefaultAsOptimal: true,
		// 	available: [
		// 		{
		// 			id: "fosscord",
		// 			name: "Fosscord",
		// 			endpoint: "127.0.0.1:3001",
		// 			vip: false,
		// 			custom: false,
		// 			deprecated: false,
		// 		},
		// 	],
		// },
	} as any);

	await Promise.all([api.start(), cdn.start(), gateway.start()]);
	console.log(`[Server] ${green(`listening on port ${bold(port)}`)}`);
}

main().catch(console.error);
