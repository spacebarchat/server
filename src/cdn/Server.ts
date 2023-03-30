/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
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

import { Server, ServerOptions } from "lambert-server";
import { Config, initDatabase, registerRoutes, Sentry } from "@fosscord/util";
import path from "path";
import avatarsRoute from "./routes/avatars";
import guildProfilesRoute from "./routes/guild-profiles";
import iconsRoute from "./routes/role-icons";
import bodyParser from "body-parser";

export type CDNServerOptions = ServerOptions;

export class CDNServer extends Server {
	public declare options: CDNServerOptions;

	constructor(options?: Partial<CDNServerOptions>) {
		super(options);
	}

	async start() {
		await initDatabase();
		await Config.init();
		await Sentry.init(this.app);

		this.app.use((req, res, next) => {
			res.set("Access-Control-Allow-Origin", "*");
			// TODO: use better CSP policy
			res.set(
				"Content-security-policy",
				"default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';",
			);
			res.set(
				"Access-Control-Allow-Headers",
				req.header("Access-Control-Request-Headers") || "*",
			);
			res.set(
				"Access-Control-Allow-Methods",
				req.header("Access-Control-Request-Methods") || "*",
			);
			next();
		});
		this.app.use(bodyParser.json({ inflate: true, limit: "10mb" }));

		await registerRoutes(this, path.join(__dirname, "routes/"));

		this.app.use("/icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /icons registered");

		this.app.use("/role-icons/", iconsRoute);
		this.log("verbose", "[Server] Route /role-icons registered");

		this.app.use("/emojis/", avatarsRoute);
		this.log("verbose", "[Server] Route /emojis registered");

		this.app.use("/stickers/", avatarsRoute);
		this.log("verbose", "[Server] Route /stickers registered");

		this.app.use("/banners/", avatarsRoute);
		this.log("verbose", "[Server] Route /banners registered");

		this.app.use("/splashes/", avatarsRoute);
		this.log("verbose", "[Server] Route /splashes registered");

		this.app.use("/discovery-splashes/", avatarsRoute);
		this.log("verbose", "[Server] Route /discovery-splashes registered");

		this.app.use("/app-icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /app-icons registered");

		this.app.use("/app-assets/", avatarsRoute);
		this.log("verbose", "[Server] Route /app-assets registered");

		this.app.use("/discover-splashes/", avatarsRoute);
		this.log("verbose", "[Server] Route /discover-splashes registered");

		this.app.use("/team-icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /team-icons registered");

		this.app.use("/channel-icons/", avatarsRoute);
		this.log("verbose", "[Server] Route /channel-icons registered");

		this.app.use(
			"/guilds/:guild_id/users/:user_id/avatars",
			guildProfilesRoute,
		);
		this.log("verbose", "[Server] Route /guilds/avatars registered");

		this.app.use(
			"/guilds/:guild_id/users/:user_id/banners",
			guildProfilesRoute,
		);
		this.log("verbose", "[Server] Route /guilds/banners registered");

		Sentry.errorHandler(this.app);

		return super.start();
	}

	async stop() {
		return super.stop();
	}
}
