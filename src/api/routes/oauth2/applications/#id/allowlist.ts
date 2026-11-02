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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/middlewares";
import { Application, User } from "@spacebar/database";
import { Config, DiscordApiErrors } from "@spacebar/util";
import { AllowlistAddRequestSchema, AllowlistedUser, ApplicationAllowlistResponse, ApplicationMembershipState, PublicUserProjection } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "ApplicationAllowlistResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: stub
        const app = await Application.findOneOrFail({
            where: { id: req.params.id as string },
            relations: { bot: true, owner: true },
            select: {
                owner: { id: true },
            },
        });

        if (req.user_id != app.owner.id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        return res.json([] satisfies ApplicationAllowlistResponse);
    },
);

router.post(
    "/",
    route({
        requestBody: "AllowlistAddRequestSchema",
        responses: {
            200: {
                body: "AllowlistedUser",
            },
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: stub
        const app = await Application.findOneOrFail({
            where: { id: req.params.id as string },
            relations: { bot: true, owner: true },
            select: {
                owner: { id: true },
            },
        });

        if (req.user_id != app.owner.id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;
        if (Number(1) >= Config.get().limits.application.maxTesters) throw DiscordApiErrors.MAXIMUM_OAUTH2_APPLICATIONS; // TODO: correct error

        const body = req.body as AllowlistAddRequestSchema;

        const targetUser = await User.findOneOrFail({
            where: {
                username: body.username,
                discriminator: body.discriminator ?? "0",
            },
        });

        return res.json({
            user: targetUser.toPartialUser(),
            state: ApplicationMembershipState.INVITED,
        } satisfies AllowlistedUser);
    },
);

router.delete(
    "/:user_id",
    route({
        responses: {
            204: {},
        },
    }),
    async (req: Request, res: Response) => {
        // TODO: stub
        const app = await Application.findOneOrFail({
            where: { id: req.params.id as string },
            relations: { bot: true, owner: true },
            select: {
                owner: Object.fromEntries(PublicUserProjection.map((x) => [x, true])),
            },
        });

        if (req.user_id != app.owner.id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        return res.status(204).json({});
    },
);

export default router;
