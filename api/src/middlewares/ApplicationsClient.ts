import express, { Request, Response, Application } from "express";
import fs from "fs";
import path from "path";
import fetch, { Response as FetchResponse } from "node-fetch";
import { Config } from "@fosscord/util";

export default function ApplicationsClient(app: Application) {
	const indexHTML = fs.readFileSync(path.join(__dirname, "..", "..", "client_test", "applications.html"), { encoding: "utf8" });

	var html = indexHTML;
	const CDN_ENDPOINT = (Config.get().cdn.endpointClient || Config.get()?.cdn.endpoint || process.env.CDN || "").replace(
		/(https?)?(:\/\/?)/g,
		""
	);
	const GATEWAY_ENDPOINT = Config.get().gateway.endpointClient || Config.get()?.gateway.endpoint || process.env.GATEWAY || "";

	if (CDN_ENDPOINT) {
		html = html.replace(/CDN_HOST: .+/, `CDN_HOST: \`${CDN_ENDPOINT}\`,`);
	}
	if (GATEWAY_ENDPOINT) {
		html = html.replace(/GATEWAY_ENDPOINT: .+/, `GATEWAY_ENDPOINT: \`${GATEWAY_ENDPOINT}\`,`);
	}

	app.get("/developers/*", (req: Request, res: Response) => {
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
		res.set("content-type", "text/html");

		res.send(html);
	});
}
