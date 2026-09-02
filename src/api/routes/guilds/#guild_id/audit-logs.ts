/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors
	
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

import { Router, Response, Request } from "express";
import { route } from "@spacebar/api/middlewares";
import { AuditLogEntry, AuditLogEvents, AuditLogResponse } from "@spacebar/schemas";
import { AuditLog, User } from "@spacebar/database";
import { FindManyOptions, FindOptionsWhere, In, LessThan, MoreThan } from "typeorm";
const router = Router({ mergeParams: true });

//TODO: implement audit logs
router.get(
    "/",
    route({
        permission: "VIEW_AUDIT_LOG",
        query: {
            before: {
                required: false,
                type: "string",
                description: "Entries before this ID",
            },
            after: {
                required: false,
                type: "string",
                description: "Entries after this ID",
            },
            limit: {
                required: false,
                type: "number",
                description: "Amount of results to return",
                default: 50,
            },
            user_id: {
                required: false,
                type: "string",
                description: "User ID of the user taking the action",
            },
            target_id: {
                required: false,
                type: "string",
                description: "User ID of the user targeted by the action",
            },
            action_type: {
                required: false,
                type: "number",
                description: "Type of audit log event",
            },
        },
        responses: {
            200: {
                body: "AuditLogResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const guildId = req.params.guild_id as string;
        const limit = Math.min(100, Number(req.query.limit ?? "50"));
        const direction = req.query.before ? "DESC" : req.query.after ? "ASC" : "DESC";
        const directionality = req.query.before ? { id: LessThan(req.query.before as string) } : req.query.after ? { id: MoreThan(req.query.after as string) } : undefined;

        const query = {
            where: {
                guild_id: guildId,
                ...(directionality ?? {}),
            },
            order: {
                id: direction,
            },
            take: limit,
        } satisfies FindManyOptions<AuditLog>;

        if (req.query.user_id) (query.where as FindOptionsWhere<AuditLog>).user_id = req.query.user_id as string;
        if (req.query.target_id) (query.where as FindOptionsWhere<AuditLog>).target_id = req.query.target_id as string;
        if (req.query.action_type) (query.where as FindOptionsWhere<AuditLog>).action_type = Number(req.query.action_type as string) as AuditLogEvents;

        const auditLogEntries: AuditLogEntry[] = (await AuditLog.find(query)).map((x) => x.toAuditLogEntry());
        const resp: AuditLogResponse = {
            audit_log_entries: auditLogEntries,
            users: [],
            integrations: [], // TODO once schemas exist
            webhooks: [], // TODO once schemas exist
            guild_scheduled_events: [], // TODO once schemas exist
            threads: [], // TODO once schemas exist
            application_commands: [], // TODO once schemas exist
            auto_moderation_rules: [], // TODO once schemas exist
        };

        resp.users = (
            await User.find({
                where: {
                    id: In(auditLogEntries.flatMap((ale) => [ale.user_id, ale.target_id]).filter((x) => x != null)),
                },
            })
        ).map((x) => x.toPartialUser());

        res.json(resp);
    },
);
export default router;
