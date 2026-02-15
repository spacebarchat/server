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

import { route } from "@spacebar/api";
import { User, UserSettings, emitEvent, Session, PrivateSessionProjection, PresenceUpdateEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { UserSettingsUpdateSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "UserSettings",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const settings = await UserSettings.getOrDefault(req.user_id);
        return res.json(settings);
    },
);

router.patch(
    "/",
    route({
        requestBody: "UserSettingsUpdateSchema",
        responses: {
            200: {
                body: "UserSettings",
            },
            400: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const body = req.body as UserSettingsUpdateSchema;
        if (!body) return res.status(400).json({ code: 400, message: "Invalid request body" });
        if (body.locale === "en") body.locale = "en-US"; // fix discord client crash on unknown locale

        const user = await User.findOneOrFail({
            where: { id: req.user_id, bot: false },
            relations: { settings: true },
        });

        if (!user.settings) user.settings = UserSettings.create<UserSettings>(body);
        else user.settings.assign(body);

        if (body.guild_folders) user.settings.guild_folders = body.guild_folders;

        await user.settings.save();
        await user.save();
        if (body.status) {
            const sessions = await Session.find({
                where: { user_id: user.id },
            });

            if (sessions && sessions.length > 0) {
                // update status for all sessions and their client_status
                await Promise.all(
                    sessions.map(async (session) => {
                        session.status = body.status!;

                        // update client_status for each platform
                        const platform = session.client_info?.platform?.toLowerCase() || "web";
                        let clientType: "desktop" | "mobile" | "web" | "embedded" = "web";
                        if (platform.includes("mobile") || platform.includes("ios") || platform.includes("android")) {
                            clientType = "mobile";
                        } else if (platform.includes("desktop") || platform.includes("windows") || platform.includes("linux") || platform.includes("mac")) {
                            clientType = "desktop";
                        } else if (platform.includes("embedded")) {
                            clientType = "embedded";
                        }

                        // ensure client_status is initialized
                        if (!session.client_status || typeof session.client_status !== "object") {
                            session.client_status = {};
                        }

                        session.client_status = {
                            ...session.client_status,
                            [clientType]: body.status!,
                        };

                        return session.save();
                    }),
                );

                // Emit PRESENCE_UPDATE event (use first session for activities)
                const primarySession = sessions[0];
                await emitEvent({
                    event: "PRESENCE_UPDATE",
                    user_id: user.id,
                    data: {
                        user: user.toPublicUser(),
                        activities: Array.isArray(primarySession.activities) ? primarySession.activities : [],
                        client_status: primarySession.client_status && typeof primarySession.client_status === "object" ? primarySession.client_status : {},
                        status: primarySession.getPublicStatus(),
                    },
                } as PresenceUpdateEvent);
            }
        }

        res.json({ ...user.settings, index: undefined });
    },
);

export default router;
