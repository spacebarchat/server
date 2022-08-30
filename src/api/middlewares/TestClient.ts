import { Config, Paths, TestClientPaths } from "@fosscord/util";
import express, { Application, Request, Response } from "express";
import fs from "fs";
import fetch, { Headers, Response as FetchResponse } from "node-fetch";
import path from "path";
import { green } from "picocolors";
import ProxyAgent from "proxy-agent";
import { AssetCacheItem } from "../util/entities/AssetCacheItem";
import { patchFile } from "..";
import { createHash } from "crypto";

const prettier = require("prettier");

export default function TestClient(app: Application) {
	const agent = new ProxyAgent();

	//build client page
	let html = fs.readFileSync(TestClientPaths.Index, { encoding: "utf8" });
	html = applyEnv(html);
	html = applyInlinePlugins(html);
	html = applyPlugins(html);
	html = applyPreloadPlugins(html);

	//load asset cache
	let newAssetCache: Map<string, AssetCacheItem> = new Map<string, AssetCacheItem>();

	console.log(`[TestClient] ${green(`Using asset cache path: ${TestClientPaths.CacheDir}`)}`);
	if (!fs.existsSync(TestClientPaths.CacheDir)) {
		fs.mkdirSync(TestClientPaths.CacheDir);
	}
	if (fs.existsSync(TestClientPaths.CacheIndex))
		newAssetCache = new Map<string, AssetCacheItem>(Object.entries(JSON.parse(fs.readFileSync(TestClientPaths.CacheIndex).toString())));

	app.use("/assets", express.static(path.join(Paths.AssetsPath)));
	app.get("/assets/:file", async (req: Request, res: Response) => {
		delete req.headers.host;
		let response: FetchResponse;
		let buffer: Buffer;
		let assetCacheItem: AssetCacheItem = new AssetCacheItem(req.params.file);
		if (newAssetCache.has(req.params.file) && fs.existsSync(newAssetCache.get(req.params.file)!.FilePath)) {
			assetCacheItem = newAssetCache.get(req.params.file)!;
			assetCacheItem.Headers.forEach((value: any, name: any) => {
				res.set(name, value);
			});
		} else {
			if(req.params.file.endsWith(".map")) {
				return res.status(404).send("Not found");	
			}
			console.log(`[TestClient] Downloading file not yet cached! Asset file: ${req.params.file}`);
			response = await fetch(`https://discord.com/assets/${req.params.file}`, {
				agent,
				// @ts-ignore
				headers: {
					...req.headers
				}
			});
			buffer = await response.buffer();
			let hash = createHash("md5").update(buffer).digest('hex');
			
			//set cache info
			assetCacheItem.Headers = Object.fromEntries(stripHeaders(response.headers));
			assetCacheItem.Key = req.params.file;
			//add to cache and save
			newAssetCache.set(req.params.file, assetCacheItem);

			if(response.status != 200) {
				return res.status(404).send("Not found");
			}
			assetCacheItem.FilePath = path.join(TestClientPaths.CacheDir, req.params.file);
			if(!fs.existsSync(TestClientPaths.CacheDir))
				fs.mkdirSync(TestClientPaths.CacheDir);
			fs.writeFileSync(TestClientPaths.CacheIndex, JSON.stringify(Object.fromEntries(newAssetCache), null, 4));
			//download file
			fs.writeFileSync(assetCacheItem.FilePath, /.*\.(js|css)/.test(req.params.file) ? patchFile(assetCacheItem.FilePath, buffer.toString()) : buffer);
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

		res.send(fs.readFileSync(TestClientPaths.Developers, { encoding: "utf8" }));
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
	const CDN_ENDPOINT = (Config.get()?.cdn.endpointPublic || process.env.CDN || "").replace(/(https?)?(:\/\/?)/g, "");
	const GATEWAY_ENDPOINT = Config.get()?.gateway.endpointPublic || process.env.GATEWAY || "";

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
	let files = fs.readdirSync(TestClientPaths.PluginsDir);
	let plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js")) plugins += `<script src='/assets/plugins/${x}'></script>\n`;
	});
	return html.replaceAll("<!-- plugin marker -->", plugins);
}

function applyInlinePlugins(html: string): string {
	// inline plugins
	let files = fs.readdirSync(TestClientPaths.InlinePluginsDir);
	let plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js")) plugins += `<script src='/assets/inline-plugins/${x}'></script>\n\n`;
	});
	return html.replaceAll("<!-- inline plugin marker -->", plugins);
}

function applyPreloadPlugins(html: string): string {
	//preload plugins
	let files = fs.readdirSync(TestClientPaths.PreloadPluginsDir);
	let plugins = "";
	files.forEach((x) => {
		if (x.endsWith(".js")) plugins += `<script>${fs.readFileSync(path.join(TestClientPaths.PreloadPluginsDir, x))}</script>\n`;
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
		"content-encoding",
		"cf-cache-status",
		"cf-ray",
		"server",
		"etag",
		"nel",
		"report-to"
	].forEach((headerName) => {
		headers.delete(headerName);
	});
	return headers;
}
