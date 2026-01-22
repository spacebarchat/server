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
                body: "WhoAmIResponse",
            },
        },
        spacebarOnly: true,
    }),
    /*
            interface Request {
            user_id: string;
            user_bot: boolean;
            tokenData: UserTokenData;
            token: { id: string; iat: number; ver?: number; did?: string };
            user: User;
            session?: Session;
            rights: Rights;
            fingerprint?: string;
        }
     */
    async (req: Request, res: Response) => {
        res.json({
            id: req.user_id,
            device_id: req.session?.session_id ?? null,
            flags: req.user?.flags ?? 0,
            rights: req.user?.rights ?? 0,
            logged_in_since: new Date(req.token.iat).toISOString(),
        });
    },
);

export default router;
