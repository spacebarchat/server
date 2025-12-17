/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

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
import { Attachment, Config, initDatabase, registerRoutes } from "@spacebar/util";
import { CORS, BodyParser } from "@spacebar/api";
import path from "path";
import avatarsRoute from "./routes/avatars";
import guildProfilesRoute from "./routes/guild-profiles";
import iconsRoute from "./routes/role-icons";
import morgan from "morgan";
import { Like } from "typeorm";

export type CDNServerOptions = ServerOptions;

export class CDNServer extends Server {
	declare public options: CDNServerOptions;

	constructor(options?: Partial<CDNServerOptions>) {
		super(options);
	}

	async start() {
		await initDatabase();
		await Config.init();
		await this.cleanupSignaturesInDb();

		const logRequests = process.env["LOG_REQUESTS"] != undefined;
		if (logRequests) {
			this.app.use(
				morgan("combined", {
					skip: (req, res) => {
						let skip = !(process.env["LOG_REQUESTS"]?.includes(res.statusCode.toString()) ?? false);
						if (process.env["LOG_REQUESTS"]?.charAt(0) == "-") skip = !skip;
						return skip;
					},
				}),
			);
		}

		const trustedProxies = Config.get().security.trustedProxies;
		if (trustedProxies) this.app.set("trust proxy", trustedProxies);

		this.app.disable("x-powered-by");

		this.app.use(CORS);
		this.app.use(BodyParser({ inflate: true, limit: "10mb" }));

		await registerRoutes(this, path.join(__dirname, "routes/"));

		this.app.use("/icons/", avatarsRoute);
		console.log("[Server] Route /icons registered");

		this.app.use("/role-icons/", iconsRoute);
		console.log("[Server] Route /role-icons registered");

		this.app.use("/emojis/", avatarsRoute);
		console.log("[Server] Route /emojis registered");

		this.app.use("/stickers/", avatarsRoute);
		console.log("[Server] Route /stickers registered");

		this.app.use("/banners/", avatarsRoute);
		console.log("[Server] Route /banners registered");

		this.app.use("/splashes/", avatarsRoute);
		console.log("[Server] Route /splashes registered");

		this.app.use("/discovery-splashes/", avatarsRoute);
		console.log("[Server] Route /discovery-splashes registered");

		this.app.use("/app-icons/", avatarsRoute);
		console.log("[Server] Route /app-icons registered");

		this.app.use("/app-assets/", avatarsRoute);
		console.log("[Server] Route /app-assets registered");

		this.app.use("/discover-splashes/", avatarsRoute);
		console.log("[Server] Route /discover-splashes registered");

		this.app.use("/team-icons/", avatarsRoute);
		console.log("[Server] Route /team-icons registered");

		this.app.use("/channel-icons/", avatarsRoute);
		console.log("[Server] Route /channel-icons registered");

		this.app.use("/guilds/:guild_id/users/:user_id/avatars", guildProfilesRoute);
		console.log("[Server] Route /guilds/avatars registered");

		this.app.use("/guilds/:guild_id/users/:user_id/banners", guildProfilesRoute);
		console.log("[Server] Route /guilds/banners registered");

		return super.start();
	}

	async stop() {
		return super.stop();
	}

	async cleanupSignaturesInDb() {
		console.log("[CDN] Cleaning up signatures in database");
		const attachmentsToFix = await Attachment.find({
			where: { url: Like("%?ex=%") },
		});
		if (attachmentsToFix.length === 0) {
			console.log("[CDN] No attachments to fix");
			return;
		}

		console.log("[CDN] Found", attachmentsToFix.length, " attachments to fix");
		for (const attachment of attachmentsToFix) {
			attachment.url = attachment.url.split("?ex=")[0];
			attachment.proxy_url = attachment.proxy_url?.split("?ex=")[0];
			await attachment.save();
			console.log(`[CDN] Fixed attachment ${attachment.id}`);
		}
	}
}
