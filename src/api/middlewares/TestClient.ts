import express, { Request, Response, Application } from "express";
import fs from "fs";
import path from "path";
import fetch, { Response as FetchResponse } from "node-fetch";
import ProxyAgent from "proxy-agent";
import { Config } from "@fosscord/util";

const ASSET_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "assets");

let hasWarnedAboutCache = false;

export default function TestClient(app: Application) {
	const agent = new ProxyAgent();
	const assetCache = new Map<
		string,
		{ response: FetchResponse; buffer: Buffer }
	>();
	const indexHTML = fs.readFileSync(
		path.join(ASSET_FOLDER_PATH, "client_test", "index.html"),
		{ encoding: "utf8" },
	);

	var html = indexHTML;
	const CDN_ENDPOINT = (
		Config.get().cdn.endpointClient ||
		Config.get()?.cdn.endpointPublic ||
		process.env.CDN ||
		""
	).replace(/(https?)?(:\/\/?)/g, "");
	const GATEWAY_ENDPOINT =
		Config.get().gateway.endpointClient ||
		Config.get()?.gateway.endpointPublic ||
		process.env.GATEWAY ||
		"";

	if (CDN_ENDPOINT) {
		html = html.replace(/CDN_HOST: .+/, `CDN_HOST: \`${CDN_ENDPOINT}\`,`);
	}
	if (GATEWAY_ENDPOINT) {
		html = html.replace(
			/GATEWAY_ENDPOINT: .+/,
			`GATEWAY_ENDPOINT: \`${GATEWAY_ENDPOINT}\`,`,
		);
	}
	// inline plugins
	var files = fs.readdirSync(path.join(ASSET_FOLDER_PATH, "preload-plugins"));
	var plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js"))
			plugins += `<script>${fs.readFileSync(
				path.join(ASSET_FOLDER_PATH, "preload-plugins", x),
			)}</script>\n`;
	});
	html = html.replaceAll("<!-- preload plugin marker -->", plugins);

	// plugins
	files = fs.readdirSync(path.join(ASSET_FOLDER_PATH, "plugins"));
	plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js"))
			plugins += `<script src='/assets/plugins/${x}'></script>\n`;
	});
	html = html.replaceAll("<!-- plugin marker -->", plugins);
	//preload plugins
	files = fs.readdirSync(path.join(ASSET_FOLDER_PATH, "preload-plugins"));
	plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js"))
			plugins += `<script>${fs.readFileSync(
				path.join(ASSET_FOLDER_PATH, "preload-plugins", x),
			)}</script>\n`;
	});
	html = html.replaceAll("<!-- preload plugin marker -->", plugins);

	app.use("/assets", express.static(path.join(ASSET_FOLDER_PATH, "public")));
	app.use("/assets", express.static(path.join(ASSET_FOLDER_PATH, "cache")));

	app.get("/assets/:file", async (req: Request, res: Response) => {
		if (!hasWarnedAboutCache) {
			hasWarnedAboutCache = true;
			if (req.params.file.includes(".js"))
				console.warn(
					`[TestClient] Cache miss for file ${req.params.file}! Use 'npm run generate:client' to cache and patch.`,
				);
		}

		delete req.headers.host;
		var response: FetchResponse;
		var buffer: Buffer;
		const cache = assetCache.get(req.params.file);
		if (!cache) {
			response = await fetch(
				`https://discord.com/assets/${req.params.file}`,
				{
					agent,
					// @ts-ignore
					headers: {
						...req.headers,
					},
				},
			);
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
					"content-encoding",
				].includes(name.toLowerCase())
			) {
				return;
			}
			res.set(name, value);
		});
		assetCache.set(req.params.file, { buffer, response });

		return res.send(buffer);
	});
	app.get("/developers*", (req: Request, res: Response) => {
		const { useTestClient } = Config.get().client;
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
		res.set("content-type", "text/html");

		if (!useTestClient)
			return res.send(
				"Test client is disabled on this instance. Use a stand-alone client to connect this instance.",
			);

		res.send(
			fs.readFileSync(
				path.join(ASSET_FOLDER_PATH, "client_test", "developers.html"),
				{ encoding: "utf8" },
			),
		);
	});
	app.get("*", (req: Request, res: Response) => {
		const { useTestClient } = Config.get().client;
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
		res.set("content-type", "text/html");

		if (req.url.startsWith("/api") || req.url.startsWith("/__development"))
			return;

		if (!useTestClient)
			return res.send(
				"Test client is disabled on this instance. Use a stand-alone client to connect this instance.",
			);
		if (req.url.startsWith("/invite"))
			return res.send(
				html.replace("9b2b7f0632acd0c5e781", "9f24f709a3de09b67c49"),
			);

		res.send(html);
	});
}
