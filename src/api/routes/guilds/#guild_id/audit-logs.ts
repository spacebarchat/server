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
import { AuditLogResponse } from "@spacebar/schemas";
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
    (req: Request, res: Response) => {
        res.json({
            audit_log_entries: [],
            users: [],
            integrations: [],
            webhooks: [],
            guild_scheduled_events: [],
            threads: [],
            application_commands: [],
            auto_moderation_rules: [],
        } satisfies AuditLogResponse);
    },
);
export default router;
