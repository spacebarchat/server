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
import { BackupCode, User, generateToken } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";
import { TotpDisableSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        requestBody: "TotpDisableSchema",
        responses: {
            200: {
                body: "TokenOnlyResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const body = req.body as TotpDisableSchema;

        const user = await User.findOneOrFail({
            where: { id: req.user_id },
            select: { totp_secret: true },
        });

        const backup = await BackupCode.findOne({ where: { code: body.code } });
        if (!backup) {
            const ret = verifyToken(user.totp_secret || "", body.code);
            if (!ret || ret.delta != 0) throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);
        }

        await User.update(
            { id: req.user_id },
            {
                mfa_enabled: false,
                totp_secret: "",
            },
        );

        await BackupCode.update(
            { user: { id: req.user_id } },
            {
                expired: true,
            },
        );

        return res.json({
            token: await generateToken(user.id),
        });
    },
);

export default router;
