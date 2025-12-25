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
import { Router } from "express";
import { BasicCrdFileRouterOptions, createBasicCrdFileRouter } from "./util/basicCrdFileRouter";

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
        const register = (path: string, ...handlers: Router[]) => {
            this.app.use(path, ...handlers);
            console.log(`[Server] Route ${path} registered`);
        };

        register("/role-icons/", iconsRoute);
        register("/guilds/:guild_id/users/:user_id/avatars", guildProfilesRoute);
        register("/guilds/:guild_id/users/:user_id/banners", guildProfilesRoute);

        if (!process.env.CDN_CRD_ROUTER) {
            register("/icons/", avatarsRoute);
            register("/emojis/", avatarsRoute);
            register("/stickers/", avatarsRoute);
            register("/banners/", avatarsRoute);
            register("/splashes/", avatarsRoute);
            register("/discovery-splashes/", avatarsRoute);
            register("/app-icons/", avatarsRoute);
            register("/app-assets/", avatarsRoute);
            register("/discover-splashes/", avatarsRoute);
            register("/team-icons/", avatarsRoute);
            register("/channel-icons/", avatarsRoute);
        } else {
            register("/icons/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "icons/", fallbackToAvatarPath: true })));
            register("/emojis/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "emojis/", fallbackToAvatarPath: true })));
            register("/stickers/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "stickers/", fallbackToAvatarPath: true })));
            register("/banners/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "banners/", fallbackToAvatarPath: true })));
            register("/splashes/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "splashes/", fallbackToAvatarPath: true })));
            register("/discovery-splashes/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "discovery-splashes/", fallbackToAvatarPath: true })));
            register("/app-icons/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "app-icons/", fallbackToAvatarPath: true })));
            register("/app-assets/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "app-assets/", fallbackToAvatarPath: true })));
            register("/discover-splashes/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "discover-splashes/", fallbackToAvatarPath: true })));
            register("/team-icons/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "team-icons/", fallbackToAvatarPath: true })));
            register("/channel-icons/", createBasicCrdFileRouter(new BasicCrdFileRouterOptions({ pathPrefix: "channel-icons/", fallbackToAvatarPath: true })));
        }

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
