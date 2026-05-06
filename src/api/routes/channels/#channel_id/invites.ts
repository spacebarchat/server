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
import { Channel, Invite, PublicInviteRelation } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { InviteCreateSchema } from "@spacebar/schemas";
import { createChannelInvite } from "../../../util/handlers/ChannelInviteCreate";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        requestBody: "InviteCreateSchema",
        permission: "CREATE_INSTANT_INVITE",
        right: "CREATE_INVITES",
        responses: {
            200: {
                body: "Invite",
            },
            201: {
                body: "Invite",
            },
            404: {},
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { user_id } = req;
        const body = req.body as InviteCreateSchema;
        const { channel_id } = req.params as { [key: string]: string };
        const { status, data } = await createChannelInvite(user_id, channel_id, body);

        res.status(status).send(data);
    },
);

router.get(
    "/",
    route({
        permission: "MANAGE_CHANNELS",
        responses: {
            200: {
                body: "APIInviteArray",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { channel_id } = req.params as { [key: string]: string };
        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
        });

        if (!channel.guild_id) {
            throw new HTTPError("This channel doesn't exist", 404);
        }
        const { guild_id } = channel;

        const invites = await Invite.find({
            where: { guild_id, channel_id },
            relations: PublicInviteRelation,
        });

        res.status(200).send(invites);
    },
);

export default router;
