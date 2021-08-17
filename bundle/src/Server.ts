process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import { FosscordServer as APIServer } from "@fosscord/api";
import { Server as GatewayServer } from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn/";
import express from "express";
import { Config } from "../../util/dist";

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
	await Config.set({
		cdn: {
			endpointClient: "${location.host}",
			endpoint: `http://localhost:${port}`,
		},
		gateway: {
			endpointClient: '${location.protocol === "https:" ? "wss://" : "ws://"}${location.host}',
			endpoint: `ws://localhost:${port}`,
		},
	});

	await api.start();
	await cdn.start();
	await gateway.start();
}

main().catch(console.error);
