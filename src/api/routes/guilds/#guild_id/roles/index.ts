/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { route } from "@fosscord/api";
import {
	Config,
	DiscordApiErrors,
	emitEvent,
	GuildRoleCreateEvent,
	GuildRoleUpdateEvent,
	Member,
	Role,
	RoleModifySchema,
	RolePositionUpdateSchema,
	Snowflake,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { Not } from "typeorm";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;

	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const roles = await Role.find({ where: { guild_id: guild_id } });

	return res.json(roles);
});

router.post(
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
		},
	}),
	async (req: Request, res: Response) => {
		const guild_id = req.params.guild_id;
		const body = req.body as RoleModifySchema;

		const role_count = await Role.count({ where: { guild_id } });
		const { maxRoles } = Config.get().limits.guild;

		if (role_count > maxRoles)
			throw DiscordApiErrors.MAXIMUM_ROLES.withParams(maxRoles);

		const role = Role.create({
			// values before ...body are default and can be overriden
			position: 1,
			hoist: false,
			color: 0,
			mentionable: false,
			...body,
			guild_id: guild_id,
			managed: false,
			permissions: String(
				(req.permission?.bitfield || 0n) &
					BigInt(body.permissions || "0"),
			),
			tags: undefined,
			icon: undefined,
			unicode_emoji: undefined,
			id: Snowflake.generate(),
		});

		await Promise.all([
			role.save(),
			// Move all existing roles up one position, to accommodate the new role
			Role.createQueryBuilder("roles")
				.where({
					guild: { id: guild_id },
					name: Not("@everyone"),
					id: Not(role.id),
				})
				.update({ position: () => "position + 1" })
				.execute(),
			emitEvent({
				event: "GUILD_ROLE_CREATE",
				guild_id,
				data: {
					guild_id,
					role: role,
				},
			} as GuildRoleCreateEvent),
		]);

		res.json(role);
	},
);

router.patch(
	"/",
	route({
		requestBody: "RolePositionUpdateSchema",
		permission: "MANAGE_ROLES",
		responses: {
			200: {
				body: "APIRoleArray",
			},
			400: {
				body: "APIErrorResponse",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const body = req.body as RolePositionUpdateSchema;

		await Promise.all(
			body.map(async (x) =>
				Role.update({ guild_id, id: x.id }, { position: x.position }),
			),
		);

		const roles = await Role.find({
			where: body.map((x) => ({ id: x.id, guild_id })),
		});

		await Promise.all(
			roles.map((x) =>
				emitEvent({
					event: "GUILD_ROLE_UPDATE",
					guild_id,
					data: {
						guild_id,
						role: x,
					},
				} as GuildRoleUpdateEvent),
			),
		);

		res.json(roles);
	},
);

export default router;
