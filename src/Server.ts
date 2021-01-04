import express, { Application, Router } from "express";
import { traverseDirectory } from "./Utils";
import { Server as HTTPServer } from "http";
import fs from "fs/promises";
import { Server, ServerOptions } from "lambert-server";

export interface DiscordServerOptions extends ServerOptions {}

declare global {
	namespace Express {
		interface Request {
			server: DiscordServer;
		}
	}
}

export class DiscordServer extends Server {
	public options: DiscordServerOptions;

	constructor(opts?: DiscordServerOptions) {
		super(opts);
	}

	async start() {
		// recursively loads files in routes/
		this.routes = await this.registerRoutes(__dirname + "/routes/");
		// const indexHTML = await (await fetch("https://discord.com/app")).buffer();
		const indexHTML = await fs.readFile(__dirname + "/../client/index.html");

		this.app.get("*", (req, res) => {
			res.set("Cache-Control", "public, max-age=" + 60 * 60 * 24);
			res.set("content-type", "text/html");
			res.send(indexHTML);
		});
		return super.start();
	}
}
