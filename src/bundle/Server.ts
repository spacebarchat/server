process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

import http from "http";
import * as Api from "@fosscord/api";
import * as Gateway from "@fosscord/gateway";
import { CDNServer } from "@fosscord/cdn";
import express from "express";
import { green, bold, yellow } from "picocolors";
import { Config, initDatabase } from "@fosscord/util";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import * as Integrations from "@sentry/integrations";

const app = express();
const server = http.createServer();
const port = Number(process.env.PORT) || 3001;
const production = process.env.NODE_ENV == "development" ? false : true;
server.on("request", app);

const api = new Api.FosscordServer({ server, port, production, app });
const cdn = new CDNServer({ server, port, production, app });
const gateway = new Gateway.Server({ server, port, production });

process.on("SIGTERM", async () => {
	console.log("Shutting down due to SIGTERM");
	server.close();
});

async function main() {
	await initDatabase();
	await Config.init();

	//Sentry
	if (Config.get().sentry.enabled) {
		console.log(
			`[Bundle] ${yellow(
				"You are using Sentry! This may slightly impact performance on large loads!",
			)}`,
		);
		Sentry.init({
			dsn: Config.get().sentry.endpoint,
			integrations: [
				new Sentry.Integrations.Http({ tracing: true }),
				new Tracing.Integrations.Express({ app }),
				new Tracing.Integrations.Mysql(),
				new Integrations.RewriteFrames({
					root: __dirname,
				}),
			],
			tracesSampleRate: Config.get().sentry.traceSampleRate,
			environment: Config.get().sentry.environment,
		});

		Sentry.addGlobalEventProcessor((event, hint) => {
			if (event.transaction) {
				// Rewrite things that look like IDs to `:id` for sentry
				event.transaction = event.transaction
					.split("/")
					.map((x) => (!parseInt(x) ? x : ":id"))
					.join("/");
			}

			// TODO: does this even do anything?
			delete event.request?.cookies;
			if (event.request?.headers) {
				delete event.request.headers["X-Real-Ip"];
				delete event.request.headers["X-Forwarded-For"];
				delete event.request.headers["X-Forwarded-Host"];
				delete event.request.headers["X-Super-Properties"];
			}

			if (event.breadcrumbs) {
				event.breadcrumbs = event.breadcrumbs.filter((x) => {
					// Filter breadcrumbs that we don't care about
					if (x.message?.includes("identified as")) return false;
					if (x.message?.includes("[WebSocket] closed")) return false;
					if (
						x.message?.includes(
							"Got Resume -> cancel not implemented",
						)
					)
						return false;
					if (x.message?.includes("[Gateway] New connection from"))
						return false;

					return true;
				});
			}

			return event;
		});

		app.use(Sentry.Handlers.requestHandler());
		app.use(Sentry.Handlers.tracingHandler());
	}

	server.listen(port);
	await Promise.all([api.start(), cdn.start(), gateway.start()]);

	if (Config.get().sentry.enabled) {
		app.use(Sentry.Handlers.errorHandler());
		app.use(function onError(err: any, req: any, res: any, next: any) {
			res.statusCode = 500;
			res.end(res.sentry + "\n");
		});
	}

	console.log(`[Server] ${green(`listening on port ${bold(port)}`)}`);
}

main().catch(console.error);
