/*
        Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
        Copyright (C) 2025 Spacebar and Spacebar Contributors

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
import { createHash } from "node:crypto";
import { Session, Snowflake } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { SessionsLogoutSchema } from "../../../schemas/api/users/SessionsSchemas";
import { In } from "typeorm";
const router = Router({ mergeParams: true });
router.get(
    "/",
    route({
        responses: {
            200: {
                body: "GetSessionsResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { extended = false } = req.query;
        const sessions = (await Session.find({ where: { user_id: req.user_id, is_admin_session: false } })) as Session[];

        res.json({
            user_sessions: sessions.map((session) => (extended ? session.getExtendedDeviceInfo() : session.getDiscordDeviceInfo())),
        });
    },
);

router.post(
    "/logout",
    route({
        requestBody: "SessionsLogoutSchema",
        responses: {
            204: {},
        },
    }),
    async (req: Request, res: Response) => {
        const body = req.body as SessionsLogoutSchema;

        let sessions: Session[] = [];
        if ("session_ids" in body) {
            sessions = (await Session.find({ where: { user_id: req.user_id, session_id: In(body.session_ids!) } })) as Session[];
        }

        if ("session_id_hashes" in body) {
            const allSessions = (await Session.find({ where: { user_id: req.user_id } })) as Session[];
            const hashSet = new Set(body.session_id_hashes);
            const matchingSessions = allSessions.filter((session) => {
                const hash = createHash("sha256").update(session.session_id).digest("hex");
                return hashSet.has(hash);
            });
            sessions.push(...matchingSessions);
        }

        for (const session of sessions) {
            await session.remove();
        }
        res.status(204).send();
    },
);
export default router;
