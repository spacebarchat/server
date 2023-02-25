/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import express, { Application } from "express";
import fs from "fs";
import path from "path";
import fetch, { Response as FetchResponse } from "node-fetch";
import ProxyAgent from "proxy-agent";
import { Config } from "@fosscord/util";

const ASSET_FOLDER_PATH = path.join(__dirname, "..", "..", "..", "assets");

let HAS_SHOWN_CACHE_WARNING = false;

export default function TestClient(app: Application) {
	app.use("/assets", express.static(path.join(ASSET_FOLDER_PATH, "public")));
	app.use("/assets", express.static(path.join(ASSET_FOLDER_PATH, "cache")));

	// Test client is disabled, so don't need to run any more. Above should probably be moved somewhere?
	if (!Config.get().client.useTestClient) {
		app.get("*", (req, res) => {
			return res.redirect("/api/ping");
		});

		return;
	}

	const agent = new ProxyAgent();

	let html = fs.readFileSync(
		path.join(ASSET_FOLDER_PATH, "client_test", "index.html"),
		{ encoding: "utf-8" },
	);

	html = applyPlugins(html); // inject our plugins
	app.use(
		"/assets/plugins",
		express.static(path.join(ASSET_FOLDER_PATH, "plugins")),
	);
	app.use(
		"/assets/inline-plugins",
		express.static(path.join(ASSET_FOLDER_PATH, "inline-plugins")),
	);

	// Asset memory cache
	const assetCache = new Map<
		string,
		{ response: FetchResponse; buffer: Buffer }
	>();

	// Fetches uncached ( on disk ) assets from discord.com and stores them in memory cache.
	app.get("/assets/:file", async (req, res) => {
		delete req.headers.host;

		if (req.params.file.endsWith(".map")) return res.status(404);

		let response: FetchResponse;
		let buffer: Buffer;
		const cache = assetCache.get(req.params.file);
		if (!cache) {
			response = await fetch(
				`https://discord.com/assets/${req.params.file}`,
				{
					agent,
					headers: { ...(req.headers as { [key: string]: string }) },
				},
			);
			buffer = await response.buffer();
		} else {
			response = cache.response;
			buffer = cache.buffer;
		}

		[
			"content-length",
			"content-security-policy",
			"strict-transport-security",
			"set-cookie",
			"transfer-encoding",
			"expect-ct",
			"access-control-allow-origin",
			"content-encoding",
		].forEach((headerName) => {
			response.headers.delete(headerName);
		});
		response.headers.forEach((value, name) => res.set(name, value));

		assetCache.set(req.params.file, { buffer, response });

		if (response.status == 200 && !HAS_SHOWN_CACHE_WARNING) {
			HAS_SHOWN_CACHE_WARNING = true;
			console.warn(
				`[TestClient] Cache miss for file ${req.params.file}! Use 'npm run generate:client' to cache and patch.`,
			);
		}

		return res.send(buffer);
	});

	// Instead of our generated html, send developers.html for developers endpoint
	app.get("/developers*", (req, res) => {
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24); // 24 hours
		res.set("content-type", "text/html");
		res.send(
			fs.readFileSync(
				path.join(ASSET_FOLDER_PATH, "client_test", "developers.html"),
				{ encoding: "utf-8" },
			),
		);
	});

	// Send our generated index.html for all routes.
	app.get("*", (req, res) => {
		res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24); // 24 hours
		res.set("content-type", "text/html");

		if (req.url.startsWith("/api") || req.url.startsWith("/__development"))
			return;

		return res.send(html);
	});
}

// Injects inline, preload, and standard plugins into index.html.
const applyPlugins = (html: string): string => {
	// Inline plugins. Injected as <script src="/assets/inline-plugins/name.js"> into head.
	const inlineFiles = fs.readdirSync(
		path.join(ASSET_FOLDER_PATH, "inline-plugins"),
	);
	const inline = inlineFiles
		.filter((x) => x.endsWith(".js"))
		.map((x) => `<script src="/assets/inline-plugins/${x}"></script>`)
		.join("\n");
	html = html.replace("<!-- inline plugin marker -->", inline);

	// Preload plugins. Text content of each plugin is injected into head.
	const preloadFiles = fs.readdirSync(
		path.join(ASSET_FOLDER_PATH, "preload-plugins"),
	);
	const preload = preloadFiles
		.filter((x) => x.endsWith(".js"))
		.map(
			(x) =>
				`<script>${fs.readFileSync(
					path.join(ASSET_FOLDER_PATH, "preload-plugins", x),
				)}</script>`,
		)
		.join("\n");
	html = html.replace("<!-- preload plugin marker -->", preload);

	// Normal plugins. Injected as <script src="/assets/plugins/name.js"> into body.
	const pluginFiles = fs.readdirSync(path.join(ASSET_FOLDER_PATH, "plugins"));
	const plugins = pluginFiles
		.filter((x) => x.endsWith(".js"))
		.map((x) => `<script src="/assets/plugins/${x}"></script>`)
		.join("\n");
	html = html.replace("<!-- plugin marker -->", plugins);

	return html;
};
