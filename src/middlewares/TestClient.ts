import bodyParser, { OptionsJson } from "body-parser";
import express, { NextFunction, Request, Response, Application } from "express";
import { HTTPError } from "lambert-server";
import fs from "fs";
import path from "path";
import fetch, { Response as FetchResponse } from "node-fetch";
import { Config } from "@fosscord/server-util";

export default function TestClient(app: Application) {
	const assetCache = new Map<string, { response: FetchResponse; buffer: Buffer }>();
	const indexHTML = fs.readFileSync(path.join(__dirname, "..", "..", "client_test", "index.html"), { encoding: "utf8" });

	app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

	app.get("/assets/:file", async (req: Request, res: Response) => {
		delete req.headers.host;
		var response: FetchResponse;
		var buffer: Buffer;
		const cache = assetCache.get(req.params.file);
		if (!cache) {
			response = await fetch(`https://discord.com/assets/${req.params.file}`, {
				// @ts-ignore
				headers: {
					...req.headers
				}
			});
			buffer = await response.buffer();
		} else {
			response = cache.response;
			buffer = cache.buffer;
		}

		response.headers.forEach((value, name) => {
			if (
				[
					"content-length",
					"content-security-policy",
					"strict-transport-security",
					"set-cookie",
					"transfer-encoding",
					"expect-ct",
					"access-control-allow-origin",
					"content-encoding"
				].includes(name.toLowerCase())
			) {
				return;
			}
			res.set(name, value);
		});
		assetCache.set(req.params.file, { buffer, response });

		return res.send(buffer);
	});
	app.get("*", (req: Request, res: Response) => {
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
		res.set("content-type", "text/html");
		var html = indexHTML;
		const CDN_ENDPOINT = Config.get()?.cdn.endpoint || process.env.CDN;
		const GATEWAY_ENDPOINT = (Config.get()?.gateway.endpoint || process.env.GATEWAY || "").replace(/(https?)?(:\/\/?)/g, "");

		if (CDN_ENDPOINT) html = html.replace(/CDN_HOST: .+/, `CDN_HOST: "${CDN_ENDPOINT}",`);
		if (GATEWAY_ENDPOINT) html = html.replace(/GATEWAY_ENDPOINT: .+/, `GATEWAY_ENDPOINT: "${GATEWAY_ENDPOINT}",`);

		res.send(html);
	});
}
