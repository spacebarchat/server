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
import { HTTPError } from "lambert-server/HTTPError";
import { route } from "@spacebar/api/middlewares";
import { Channel, Guild, Invite, PublicInviteRelation, User } from "@spacebar/database";
import { InviteCreateEvent, emitEvent } from "@spacebar/util";
import { InviteCreateSchema, isTextChannel, PublicUserProjection, InviteListResponse, PublicInvite } from "@spacebar/schemas";
import { Random } from "@spacebar/extensions";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        requestBody: "InviteCreateSchema",
        permission: "CREATE_INSTANT_INVITE",
        right: "CREATE_INVITES",
        responses: {
            201: {
                body: "PublicInvite",
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
        const channel = await Channel.findOneOrFail({
            where: { id: channel_id },
            select: { id: true, name: true, type: true, guild_id: true },
        });
        isTextChannel(channel.type);

        if (!channel.guild_id) {
            throw new HTTPError("This channel doesn't exist", 404);
        }
        const { guild_id } = channel;

        const guild = await Guild.findOneOrFail({ where: { id: guild_id } });

        const expires_at = body.max_age == 0 || body.max_age == undefined ? undefined : new Date(body.max_age * 1000 + Date.now());

        const invite = await Invite.create({
            code: Random.getString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 6),
            temporary: body.temporary || true,
            uses: 0,
            max_uses: body.max_uses ? Math.max(0, body.max_uses) : 0,
            max_age: body.max_age ? Math.max(0, body.max_age) : 0,
            expires_at,
            created_at: new Date(),
            guild_id,
            guild,
            channel_id: channel_id,
            channel: channel,
            inviter_id: user_id,
            inviter: await User.findOneOrFail({
                where: { id: req.user_id },
                select: Object.fromEntries(PublicUserProjection.map((i) => [i, true])), // TODO: clean up
            }),
            flags: body.flags ?? 0,
        }).save();

        await emitEvent({
            event: "INVITE_CREATE",
            data: invite.toGatewayInviteCreateData(),
            guild_id,
        } satisfies InviteCreateEvent);

        res.status(201).send(invite.toPublicJSON());
    },
);

router.get(
    "/",
    route({
        permission: "MANAGE_CHANNELS",
        responses: {
            200: {
                body: "InviteListResponse",
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

        const invites = (
            await Invite.find({
                where: { guild_id, channel_id },
                relations: Object.fromEntries(PublicInviteRelation.map((i) => [i, true])), //TODO: cleanup
            })
        ).map((x) => x.toPublicJSON());

        res.status(200).send(invites satisfies InviteListResponse);
    },
);

export default router;
