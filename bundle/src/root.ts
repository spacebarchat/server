process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import { FosscordServer as APIServer } from "@fosscord/api";
import { Server as GatewayServer } from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn/";
import { Config } from "../../util/dist";

const production = true;

const api = new APIServer({ production, port: Number(process.env.API_PORT) || 3001 });
const gateway = new GatewayServer({ port: Number(process.env.GATEWAY_PORT) || 3002 });
const cdn = new CDNServer({ production, port: Number(process.env.CDN_PORT) || 3003 });

async function main() {
	await Config.set({
		cdn: {
			endpointClient: "${location.host}",
			endpoint: `http://localhost:${cdn.options.port}`,
		},
		gateway: {
			endpointClient:
				'${location.protocol === "https:" ? "wss://" : "ws://"}${location.hostname}:' + gateway.port,
			endpoint: `ws://localhost:${gateway.port}`,
		},
	});

	await api.start();
	await cdn.start();
	await gateway.start();
}

main().catch(console.error);
