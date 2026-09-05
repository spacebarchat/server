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
import { AuditLog, Member, Role } from "@spacebar/database";
import { emitEvent, GuildRoleDeleteEvent, GuildRoleUpdateEvent, handleFile } from "@spacebar/util";
import { AuditLogEvents, RoleModifySchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "Role",
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
        const { guild_id, role_id } = req.params as { [key: string]: string };
        await Member.IsInGuildOrFail(req.user_id, guild_id);
        const role = await Role.findOneOrFail({
            where: { guild_id, id: role_id },
        });
        return res.json(role);
    },
);

router.delete(
    "/",
    route({
        permission: "MANAGE_ROLES",
        responses: {
            204: {},
            400: {
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
        const { guild_id, role_id } = req.params as { [key: string]: string };
        if (role_id === guild_id) throw new HTTPError("You can't delete the @everyone role");

        await Promise.all([
            Role.delete({
                id: role_id,
                guild_id: guild_id,
            }),
            AuditLog.createAuditLog({
                guild_id,
                user_id: req.user_id,
                target_id: role_id,
                action_type: AuditLogEvents.ROLE_DELETE,
            }),
            emitEvent({
                event: "GUILD_ROLE_DELETE",
                guild_id,
                data: {
                    guild_id,
                    role_id,
                },
            } satisfies GuildRoleDeleteEvent),
        ]);

        res.sendStatus(204);
    },
);

// TODO: check role hierarchy

router.patch(
    "/",
    route({
        requestBody: "RoleModifySchema",
        permission: "MANAGE_ROLES",
        responses: {
            200: {
                body: "Role",
            },
            400: {
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
        const { role_id, guild_id } = req.params as { [key: string]: string };
        const body = req.body as RoleModifySchema;

        if (body.icon && body.icon.length) body.icon = await handleFile(`/role-icons/${role_id}`, body.icon as string);
        else body.icon = undefined;

        // TODO: proper field error
        if (body.name && body.name.length > 255) throw new Error("Role name must not exceed 255 characters");

        const role = await Role.findOneOrFail({
            where: { id: role_id, guild: { id: guild_id } },
        });
        const oldRole: Partial<Role> = {
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            mentionable: role.mentionable,
            permissions: role.permissions,
            icon: role.icon,
            unicode_emoji: role.unicode_emoji,
            position: role.position,
        };
        role.assign({
            ...body,
            permissions: String((req.permission?.bitfield || 0n) & BigInt(body.permissions || "0")),
        });

        await Promise.all([
            role.save(),
            AuditLog.createAuditLog({
                guild_id,
                user_id: req.user_id,
                target_id: role_id,
                action_type: AuditLogEvents.ROLE_UPDATE,
                changes: AuditLog.computeChanges(oldRole, role, [
                    "name",
                    "color",
                    "hoist",
                    "mentionable",
                    "permissions",
                    "icon",
                    "unicode_emoji",
                    "position",
                ]),
            }),
            emitEvent({
                event: "GUILD_ROLE_UPDATE",
                guild_id,
                data: {
                    guild_id,
                    role,
                },
            } satisfies GuildRoleUpdateEvent),
        ]);

        res.json(role);
    },
);

export default router;
