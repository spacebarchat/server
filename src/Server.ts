process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import * as Api from "@fosscord/api";
import { CDNServer } from "@fosscord/cdn";
import * as Gateway from "@fosscord/gateway";
import { Config, getOrInitialiseDatabase } from "@fosscord/util";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import express from "express";
import http from "http";
import { bold, green, yellow } from "picocolors";
// import { PluginLoader } from "@fosscord/util";

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

//this is what has been added for the /stop API route
process.on("SIGTERM", () => {
	setTimeout(() => process.exit(0), 3000);
	server.close(() => {
		console.log("Stop API has been successfully POSTed, SIGTERM sent");
	});
});
//this is what has been added for the /stop API route

async function main() {
	server.listen(port);
	await getOrInitialiseDatabase();
	await Config.init();

	//Sentry
	if (Config.get().sentry.enabled) {
		console.log(`[Bundle] ${yellow("You are using Sentry! This may slightly impact performance on large loads!")}`);
		Sentry.init({
			dsn: Config.get().sentry.endpoint,
			integrations: [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ app })],
			tracesSampleRate: Config.get().sentry.traceSampleRate,
			environment: Config.get().sentry.environment
		});

		app.use(Sentry.Handlers.requestHandler());
		app.use(Sentry.Handlers.tracingHandler());
	}
	await Promise.all([api.start(), cdn.start(), gateway.start()]);
	if (Config.get().sentry.enabled) {
		app.use(Sentry.Handlers.errorHandler());
		app.use(function onError(err: any, req: any, res: any, next: any) {
			res.statusCode = 500;
			res.end(res.sentry + "\n");
		});
	}
	console.log(`[Server] ${green(`listening on port ${bold(port)}`)}`);
	// PluginLoader.loadPlugins();
}

main().catch(console.error);
