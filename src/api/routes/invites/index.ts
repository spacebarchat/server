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
import { Ban, Config, DiscordApiErrors, emitEvent, getPermission, Guild, Invite, InviteDeleteEvent, PublicInviteRelation, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { UserFlags } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.get(
    "/:invite_code",
    route({
        responses: {
            "200": {
                body: "Invite",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { invite_code } = req.params;

        const invite = await Invite.findOneOrFail({
            where: { code: invite_code },
            relations: PublicInviteRelation,
        });

        res.status(200).send(invite.toPublicJSON());
    },
);

router.post(
    "/:invite_code",
    route({
        right: "USE_MASS_INVITES",
        responses: {
            "200": {
                body: "Invite",
            },
            401: {
                body: "APIErrorResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        if (req.user_bot && !Config.get().user.botsCanUseInvites) throw DiscordApiErrors.BOT_PROHIBITED_ENDPOINT;

        const { invite_code } = req.params;
        const { public_flags } = req.user;
        const { guild_id } = await Invite.findOneOrFail({
            where: { code: invite_code },
        });
        const { features } = await Guild.findOneOrFail({
            where: { id: guild_id },
        });
        const ban = await Ban.findOne({
            where: [
                { guild_id: guild_id, user_id: req.user_id },
                { guild_id: guild_id, ip: req.ip },
            ],
        });

        if (ban) {
            console.log(`[Invite] User ${req.user_id} tried to join guild ${guild_id} but is banned by ${ban.user_id === req.user_id ? "User ID" : "IP address"}.`);
            throw DiscordApiErrors.USER_BANNED;
        }

        if ((BigInt(public_flags) & UserFlags.FLAGS.QUARANTINED) === UserFlags.FLAGS.QUARANTINED) {
            console.log(`[Invite] User ${req.user_id} tried to join guild ${guild_id} but is quarantined.`);
            throw DiscordApiErrors.UNKNOWN_INVITE;
        }

        if (features.includes("INTERNAL_EMPLOYEE_ONLY") && (public_flags & 1) !== 1) {
            console.log(`[Invite] User ${req.user_id} tried to join guild ${guild_id} but is not staff.`);
            throw new HTTPError("Only intended for the staff of this instance.", 401);
        }

        if (features.includes("INVITES_DISABLED")) {
            console.log(`[Invite] User ${req.user_id} tried to join guild ${guild_id} but joins are closed.`);
            throw new HTTPError("Sorry, this guild has joins closed.", 403);
        }

        const invite = await Invite.joinGuild(req.user_id, invite_code);

        res.json(invite);
    },
);

// * cant use permission of route() function because path doesn't have guild_id/channel_id
router.delete(
    "/:invite_code",
    route({
        responses: {
            "200": {
                body: "Invite",
            },
            401: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { invite_code } = req.params;
        const invite = await Invite.findOneOrFail({ where: { code: invite_code } });
        const { guild_id, channel_id } = invite;

        const permission = await getPermission(req.user_id, guild_id, channel_id);

        if (!permission.has("MANAGE_GUILD") && !permission.has("MANAGE_CHANNELS")) throw new HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);

        await Promise.all([
            Invite.delete({ code: invite_code }),
            emitEvent({
                event: "INVITE_DELETE",
                guild_id: guild_id,
                data: {
                    channel_id: channel_id,
                    guild_id: guild_id,
                    code: invite_code,
                },
            } as InviteDeleteEvent),
        ]);

        res.json({ invite: invite });
    },
);

export default router;
