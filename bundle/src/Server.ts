process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import { FosscordServer as APIServer } from "@fosscord/api";
import { Server as GatewayServer } from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn/";
import express from "express";
import { Config, initDatabase } from "@fosscord/util";

const app = express();
const server = http.createServer();
const port = Number(process.env.PORT) || 3001;
const production = false;
server.on("request", app);

// @ts-ignore
const api = new APIServer({ server, port, production, app });
// @ts-ignore
const cdn = new CDNServer({ server, port, production, app });
// @ts-ignore
const gateway = new GatewayServer({ server, port, production });

async function main() {
	await initDatabase();
	await Config.init();
	// only set endpointPublic, if not already set
	await Config.set({
		cdn: {
			endpointClient: "${location.host}",
			endpointPrivate: `http://localhost:${port}`,
			...(!Config.get().cdn.endpointPublic && {
				endpointPublic: `http://localhost:${port}`,
			}),
		},
		gateway: {
			endpointClient:
				'${location.protocol === "https:" ? "wss://" : "ws://"}${location.host}',
			endpointPrivate: `ws://localhost:${port}`,
			...(!Config.get().gateway.endpointPublic && {
				endpointPublic: `http://localhost:${port}`,
			}),
		},
	} as any);

	await Promise.all([api.start(), cdn.start(), gateway.start()]);
	console.log(`[Server] listening on port ${port}`);
}

main().catch(console.error);
