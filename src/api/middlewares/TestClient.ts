import express, { Request, Response, Application } from "express";
import fs from "fs";
import path from "path";
import fetch, { Response as FetchResponse, Headers } from "node-fetch";
import ProxyAgent from "proxy-agent";
import { Config } from "@fosscord/util";
import { AssetCacheItem } from "../util/entities/AssetCacheItem";
import { green } from "picocolors";

const AssetsPath = path.join(__dirname, "..", "..", "..", "assets");

export default function TestClient(app: Application) {
	const agent = new ProxyAgent();

	//build client page
	let html = fs.readFileSync(path.join(AssetsPath, "index.html"), { encoding: "utf8" });
	html = applyEnv(html);
	html = applyInlinePlugins(html);
	html = applyPlugins(html);
	html = applyPreloadPlugins(html);

	//load asset cache
	let newAssetCache: Map<string, AssetCacheItem> = new Map<string, AssetCacheItem>();
	let assetCacheDir = path.join(AssetsPath, "cache");
	if (process.env.ASSET_CACHE_DIR) assetCacheDir = process.env.ASSET_CACHE_DIR;

	console.log(`[TestClient] ${green(`Using asset cache path: ${assetCacheDir}`)}`);
	if (!fs.existsSync(assetCacheDir)) {
		fs.mkdirSync(assetCacheDir);
	}
	if (fs.existsSync(path.join(assetCacheDir, "index.json"))) {
		let rawdata = fs.readFileSync(path.join(assetCacheDir, "index.json"));
		newAssetCache = new Map<string, AssetCacheItem>(Object.entries(JSON.parse(rawdata.toString())));
	}

	app.use("/assets", express.static(path.join(AssetsPath)));
	app.get("/assets/:file", async (req: Request, res: Response) => {
		delete req.headers.host;
		let response: FetchResponse;
		let buffer: Buffer;
		let assetCacheItem: AssetCacheItem = new AssetCacheItem(req.params.file);
		if (newAssetCache.has(req.params.file)) {
			assetCacheItem = newAssetCache.get(req.params.file)!;
			assetCacheItem.Headers.forEach((value: any, name: any) => {
				res.set(name, value);
			});
		} else {
			console.log(`[TestClient] Downloading file not yet cached! Asset file: ${req.params.file}`);
			response = await fetch(`https://discord.com/assets/${req.params.file}`, {
				agent,
				// @ts-ignore
				headers: {
					...req.headers
				}
			});

			//set cache info
			assetCacheItem.Headers = Object.fromEntries(stripHeaders(response.headers));
			assetCacheItem.FilePath = path.join(assetCacheDir, req.params.file);
			assetCacheItem.Key = req.params.file;
			//add to cache and save
			newAssetCache.set(req.params.file, assetCacheItem);
			fs.writeFileSync(path.join(assetCacheDir, "index.json"), JSON.stringify(Object.fromEntries(newAssetCache), null, 4));
			//download file
			fs.writeFileSync(assetCacheItem.FilePath, await response.buffer());
		}

		assetCacheItem.Headers.forEach((value: string, name: string) => {
			res.set(name, value);
		});
		return res.send(fs.readFileSync(assetCacheItem.FilePath));
	});
	app.get("/developers*", (_req: Request, res: Response) => {
		const { useTestClient } = Config.get().client;
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
		res.set("content-type", "text/html");

		if (!useTestClient) return res.send("Test client is disabled on this instance. Use a stand-alone client to connect this instance.");

		res.send(fs.readFileSync(path.join(__dirname, "..", "..", "client_test", "developers.html"), { encoding: "utf8" }));
	});
	app.get("*", (req: Request, res: Response) => {
		const { useTestClient } = Config.get().client;
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
		res.set("content-type", "text/html");

		if (req.url.startsWith("/api") || req.url.startsWith("/__development")) return;

		if (!useTestClient) return res.send("Test client is disabled on this instance. Use a stand-alone client to connect this instance.");
		if (req.url.startsWith("/invite")) return res.send(html.replace("9b2b7f0632acd0c5e781", "9f24f709a3de09b67c49"));

		res.send(html);
	});
}

function applyEnv(html: string): string {
	const CDN_ENDPOINT = (Config.get().cdn.endpointClient || Config.get()?.cdn.endpointPublic || process.env.CDN || "").replace(
		/(https?)?(:\/\/?)/g,
		""
	);
	const GATEWAY_ENDPOINT = Config.get().gateway.endpointClient || Config.get()?.gateway.endpointPublic || process.env.GATEWAY || "";

	if (CDN_ENDPOINT) {
		html = html.replace(/CDN_HOST: .+/, `CDN_HOST: \`${CDN_ENDPOINT}\`,`);
	}
	if (GATEWAY_ENDPOINT) {
		html = html.replace(/GATEWAY_ENDPOINT: .+/, `GATEWAY_ENDPOINT: \`${GATEWAY_ENDPOINT}\`,`);
	}
	return html;
}

function applyPlugins(html: string): string {
	// plugins
	let files = fs.readdirSync(path.join(AssetsPath, "plugins"));
	let plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js")) plugins += `<script src='/assets/plugins/${x}'></script>\n`;
	});
	return html.replaceAll("<!-- plugin marker -->", plugins);
}

function applyInlinePlugins(html: string): string {
	// inline plugins
	let files = fs.readdirSync(path.join(AssetsPath, "inline-plugins"));
	let plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js")) plugins += `<script src='/assets/inline-plugins/${x}'></script>\n\n`;
	});
	return html.replaceAll("<!-- inline plugin marker -->", plugins);
}

function applyPreloadPlugins(html: string): string {
	//preload plugins
	let files = fs.readdirSync(path.join(AssetsPath, "preload-plugins"));
	let plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js")) plugins += `<script>${fs.readFileSync(path.join(AssetsPath, "preload-plugins", x))}</script>\n`;
	});
	return html.replaceAll("<!-- preload plugin marker -->", plugins);
}

function stripHeaders(headers: Headers): Headers {
	[
		"content-length",
		"content-security-policy",
		"strict-transport-security",
		"set-cookie",
		"transfer-encoding",
		"expect-ct",
		"access-control-allow-origin",
		"content-encoding"
	].forEach((headerName) => {
		headers.delete(headerName);
	});
	return headers;
}
