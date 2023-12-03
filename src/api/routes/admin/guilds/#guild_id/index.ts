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
	AdminGuildProjection,
	Channel,
	Guild,
	GuildAdminModifySchema,
	GuildUpdateEvent,
	Permissions,
	emitEvent,
	handleFile,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.get(
	"/",
	route({
		description: "Get a guild",
		right: "MANAGE_GUILDS",
		responses: {
			200: {
				body: "GuildAdminResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const guild = await Guild.findOneOrFail({
			where: {
				id: guild_id,
			},
			select: [...AdminGuildProjection],
		});
		res.send(guild);
	},
);

router.patch(
	"/",
	route({
		requestBody: "GuildAdminModifySchema",
		right: "MANAGE_GUILDS",
		responses: {
			"200": {
				body: "GuildAdminResponse",
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
		const body = req.body as GuildAdminModifySchema;
		const { id: guild_id } = req.params;

		const guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			select: AdminGuildProjection,
			// relations: ["emojis", "roles", "stickers"],
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
			// for some reason, they don't update in the assign.
			guild.features = body.features;
		}

		// TODO: check if body ids are valid
		guild.assign(body);

		if (body.public_updates_channel_id == "1") {
			// create an updates channel for them
			const channel = await Channel.createChannel(
				{
					name: "moderator-only",
					guild_id: guild.id,
					position: 0,
					type: 0,
					permission_overwrites: [
						// remove SEND_MESSAGES from @everyone
						{
							id: guild.id,
							allow: "0",
							deny: Permissions.FLAGS.VIEW_CHANNEL.toString(),
							type: 0,
						},
					],
				},
				undefined,
				{ skipPermissionCheck: true },
			);

			await Guild.insertChannelInOrder(guild.id, channel.id, 0, guild);

			guild.public_updates_channel_id = channel.id;
		} else if (body.public_updates_channel_id != undefined) {
			// ensure channel exists in this guild
			await Channel.findOneOrFail({
				where: { guild_id, id: body.public_updates_channel_id },
				select: { id: true },
			});
		}

		if (body.rules_channel_id == "1") {
			// create a rules for them
			const channel = await Channel.createChannel(
				{
					name: "rules",
					guild_id: guild.id,
					position: 0,
					type: 0,
					permission_overwrites: [
						// remove SEND_MESSAGES from @everyone
						{
							id: guild.id,
							allow: "0",
							deny: Permissions.FLAGS.SEND_MESSAGES.toString(),
							type: 0,
						},
					],
				},
				undefined,
				{ skipPermissionCheck: true },
			);

			await Guild.insertChannelInOrder(guild.id, channel.id, 0, guild);

			guild.rules_channel_id = channel.id;
		} else if (body.rules_channel_id != undefined) {
			// ensure channel exists in this guild
			await Channel.findOneOrFail({
				where: { guild_id, id: body.rules_channel_id },
				select: { id: true },
			});
		}

		const data = guild.toJSON();
		// TODO: guild hashes
		// TODO: fix vanity_url_code, template_id
		// delete data.vanity_url_code;
		delete data.template_id;

		await Promise.all([
			guild.save(),
			emitEvent({
				event: "GUILD_UPDATE",
				data,
				guild_id: guild_id,
			} as GuildUpdateEvent),
		]);

		return res.json({
			...data,
			template_id: guild.template_id,
		});
	},
);

router.delete(
	"/",
	route({
		description: "Delete a guild",
		right: "MANAGE_GUILDS",
		responses: {
			200: {},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const guild = await Guild.findOneOrFail({ where: { id: guild_id } });
		await guild.remove();
		res.sendStatus(200);
	},
);

export default router;
