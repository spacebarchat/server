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
import guildProfilesRoute from "./routes/guild-profiles";
import morgan from "morgan";
import { storage } from "./util";

export type CDNServerOptions = ServerOptions;

export class CDNServer extends Server {
    declare public options: CDNServerOptions;

    constructor(options?: Partial<CDNServerOptions>) {
        super(options);
    }

    async start() {
        await initDatabase();
        await Config.init();

        this.migrateAttachments().then(
            (_) => console.log("[CDN] Successfully migrated attachments"),
            (_) => console.log("[CDN] Attachment migration failed"),
        );

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

        this.app.use("/guilds/:guild_id/users/:user_id/avatars", guildProfilesRoute);
        if (process.env.LOG_ROUTES !== "false") console.log("[Server] Route /guilds/:guild_id/users/:user_id/avatars registered");

        this.app.use("/guilds/:guild_id/users/:user_id/banners", guildProfilesRoute);
        if (process.env.LOG_ROUTES !== "false") console.log("[Server] Route /guilds/:guild_id/users/:user_id/banners registered");

        return super.start();
    }

    async migrateAttachments() {
        if (await storage.exists(".mig_complete.attachments1")) return;
        for await (const attachment of await Attachment.createQueryBuilder("attachments").where("message_id is not null").select().stream()) {
            const oldPath = `attachments/${attachment.attachments_channel_id}/${attachment.attachments_id}/${attachment.attachments_filename}`;
            const newPath = `attachments/${attachment.attachments_channel_id}/${attachment.attachments_message_id}/${attachment.attachments_filename}`;
            if (!(await storage.exists(oldPath))) {
                console.log(`[CDN/Attachments] Attachment migration: could not find old path, skipping migration: ` + oldPath);
                continue;
            }
            await storage.move(oldPath, newPath);
        }
        await storage.set(".mig_complete.attachments1", Buffer.from([1]));
    }

    async stop() {
        return super.stop();
    }
}
