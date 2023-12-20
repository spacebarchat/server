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
import {
	emitEvent,
	getRights,
	GuildRoleDeleteEvent,
	GuildRoleUpdateEvent,
	handleFile,
	Member,
	Role,
	RoleModifySchema,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

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
		const { guild_id, role_id } = req.params;
		const rights = await getRights(req.user_id);
		// admins dont need to be in the guild
		if (!rights.has("OPERATOR"))
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
		right: "OPERATOR",
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
		const { guild_id, role_id } = req.params;
		if (role_id === guild_id)
			throw new HTTPError("You can't delete the @everyone role");

		await Promise.all([
			Role.delete({
				id: role_id,
				guild_id: guild_id,
			}),
			emitEvent({
				event: "GUILD_ROLE_DELETE",
				guild_id,
				data: {
					guild_id,
					role_id,
				},
			} as GuildRoleDeleteEvent),
		]);

		res.sendStatus(204);
	},
);

// TODO: check role hierarchy

router.patch(
	"/",
	route({
		requestBody: "RoleModifySchema",
		right: "OPERATOR",
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
		const { role_id, guild_id } = req.params;
		const body = req.body as RoleModifySchema;

		if (body.icon && body.icon.length)
			body.icon = await handleFile(
				`/role-icons/${role_id}`,
				body.icon as string,
			);
		else body.icon = undefined;

		const role = await Role.findOneOrFail({
			where: { id: role_id, guild: { id: guild_id } },
		});
		role.assign({
			...body,
			permissions: String(
				(req.permission?.bitfield || 0n) &
					BigInt(body.permissions || "0"),
			),
		});

		await Promise.all([
			role.save(),
			emitEvent({
				event: "GUILD_ROLE_UPDATE",
				guild_id,
				data: {
					guild_id,
					role,
				},
			} as GuildRoleUpdateEvent),
		]);

		res.json(role);
	},
);

export default router;
