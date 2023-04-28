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
	DiscordApiErrors,
	Guild,
	GuildUpdateEvent,
	GuildUpdateSchema,
	Member,
	SpacebarApiErrors,
	emitEvent,
	getPermission,
	getRights,
	handleFile,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";

const router = Router();

router.get(
	"/",
	route({
		responses: {
			"200": {
				body: "APIGuildWithJoinedAt",
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
		const { guild_id } = req.params;

		const [guild, member] = await Promise.all([
			Guild.findOneOrFail({ where: { id: guild_id } }),
			Member.findOne({ where: { guild_id: guild_id, id: req.user_id } }),
		]);
		if (!member)
			throw new HTTPError(
				"You are not a member of the guild you are trying to access",
				401,
			);

		return res.send({
			...guild,
			joined_at: member?.joined_at,
		});
	},
);

router.patch(
	"/",
	route({
		requestBody: "GuildUpdateSchema",
		permission: "MANAGE_GUILD",
		responses: {
			"200": {
				body: "GuildUpdateSchema",
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
		const body = req.body as GuildUpdateSchema;
		const { guild_id } = req.params;

		const rights = await getRights(req.user_id);
		const permission = await getPermission(req.user_id, guild_id);

		if (!rights.has("MANAGE_GUILDS") && !permission.has("MANAGE_GUILD"))
			throw DiscordApiErrors.MISSING_PERMISSIONS.withParams(
				"MANAGE_GUILDS",
			);

		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			relations: ["emojis", "roles", "stickers"],
		});

		// TODO: guild update check image

		if (body.icon && body.icon != guild.icon)
			body.icon = await handleFile(`/icons/${guild_id}`, body.icon);

		if (body.banner && body.banner !== guild.banner)
			body.banner = await handleFile(`/banners/${guild_id}`, body.banner);

		if (body.splash && body.splash !== guild.splash)
			body.splash = await handleFile(
				`/splashes/${guild_id}`,
				body.splash,
			);

		if (
			body.discovery_splash &&
			body.discovery_splash !== guild.discovery_splash
		)
			body.discovery_splash = await handleFile(
				`/discovery-splashes/${guild_id}`,
				body.discovery_splash,
			);

		if (body.features) {
			const diff = guild.features
				.filter((x) => !body.features?.includes(x))
				.concat(
					body.features.filter((x) => !guild.features.includes(x)),
				);

			// TODO move these
			const MUTABLE_FEATURES = [
				"COMMUNITY",
				"INVITES_DISABLED",
				"DISCOVERABLE",
			];

			for (const feature of diff) {
				if (MUTABLE_FEATURES.includes(feature)) continue;

				throw SpacebarApiErrors.FEATURE_IS_IMMUTABLE.withParams(
					feature,
				);
			}

			// for some reason, they don't update in the assign.
			guild.features = body.features;
		}

		// TODO: check if body ids are valid
		guild.assign(body);

		const data = guild.toJSON();
		// TODO: guild hashes
		// TODO: fix vanity_url_code, template_id
		delete data.vanity_url_code;
		delete data.template_id;

		await Promise.all([
			guild.save(),
			emitEvent({
				event: "GUILD_UPDATE",
				data,
				guild_id,
			} as GuildUpdateEvent),
		]);

		return res.json(data);
	},
);

export default router;
