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
import { Application, DiscordApiErrors, User, createAppBotUser, generateToken, handleFile } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";
import { BotModifySchema } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        responses: {
            204: {
                body: "TokenOnlyResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const app = await Application.findOneOrFail({
            where: { id: req.params.application_id },
            relations: { owner: true },
        });

        if (app.owner.id != req.user_id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        const user = await createAppBotUser(app, req);

        res.send({
            token: await generateToken(user.id),
        });
    },
);

router.post(
    "/reset",
    route({
        responses: {
            200: {
                body: "TokenResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const bot = await User.findOneOrFail({ where: { id: req.params.application_id } });
        const owner = req.user;

        if (owner.id != req.user_id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        if (owner.totp_secret && (!req.body.code || verifyToken(owner.totp_secret, req.body.code))) throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

        bot.data = { hash: undefined, valid_tokens_since: new Date() };

        await bot.save();

        const token = await generateToken(bot.id);

        res.json({ token }).status(200);
    },
);

router.patch(
    "/",
    route({
        requestBody: "BotModifySchema",
        responses: {
            200: {
                body: "Application",
            },
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const body = req.body as BotModifySchema;
        if (!body.avatar?.trim()) delete body.avatar;

        const app = await Application.findOneOrFail({
            where: { id: req.params.application_id },
            relations: { bot: true, owner: true },
        });

        if (!app.bot) throw DiscordApiErrors.BOT_ONLY_ENDPOINT;

        if (app.owner.id != req.user_id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        if (body.avatar) body.avatar = await handleFile(`/avatars/${app.id}`, body.avatar as string);

        app.bot.assign(body);

        app.bot.save();

        await app.save();
        res.json(app).status(200);
    },
);

export default router;
