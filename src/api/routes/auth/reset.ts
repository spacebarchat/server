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

import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/util/handlers/route";
import { Session, User } from "@spacebar/database";
import { checkToken, Email, FieldErrors, generateToken } from "@spacebar/util";
import { PasswordResetSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

// TODO: the response interface also returns settings, but this route doesn't actually return that.
router.post(
    "/",
    route({
        requestBody: "PasswordResetSchema",
        responses: {
            200: {
                body: "TokenOnlyResponse",
            },
            400: {
                body: "APIErrorOrCaptchaResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { password, token } = req.body as PasswordResetSchema;

        // TODO: require MFA
        let userTokenData;
        let user;
        try {
            userTokenData = await checkToken(token, {
                select: ["email"],
                fingerprint: req.fingerprint,
                ipAddress: req.ip,
            });

            user = userTokenData.user;
        } catch {
            /* empty */
        }

        if (
            !userTokenData ||
            !user ||
            // validate that we have a session
            !userTokenData.decoded.did ||
            !userTokenData.session?.session_id ||
            // validate the token has the `account.password.reset` scope to avoid allowing arbitrary tokens
            !userTokenData.decoded.scopes?.includes("account.password.reset")
        )
            throw FieldErrors({
                password: {
                    message: req.t("auth:password_reset.INVALID_TOKEN"),
                    code: "INVALID_TOKEN",
                },
            });

        // the salt is saved in the password refer to bcrypt docs
        const hash = await bcrypt.hash(password, 12);

        const data = {
            data: {
                hash,
                valid_tokens_since: new Date(),
            },
        };
        await User.update({ id: user.id }, data);
        await Session.delete({ user_id: user.id, session_id: userTokenData.decoded.did });

        if (user.email)
            // checking anyways because we might have generated the link out of band
            await Email.sendPasswordChanged(user, user.email!);

        res.json({ token: await generateToken(user.id) });
    },
);

export default router;
