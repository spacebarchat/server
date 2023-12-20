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
	Config,
	DiscordApiErrors,
	Guild,
	GuildCreateSchema,
	Member,
	getRights,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { ILike, MoreThan } from "typeorm";

const router: Router = Router();

router.get(
	"/",
	route({
		description: "Get a list of guilds",
		right: "OPERATOR",
		query: {
			limit: {
				description:
					"max number of guilds to return (1-1000). default 100",
				type: "number",
				required: false,
			},
			after: {
				description: "The amount of guilds to skip",
				type: "number",
				required: false,
			},
			query: {
				description: "The search query",
				type: "string",
				required: false,
			},
		},
		responses: {
			200: {
				body: "AdminGuildsResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { after, query } = req.query as {
			after?: number;
			query?: string;
		};

		const limit = Number(req.query.limit) || 100;
		if (limit > 1000 || limit < 1)
			throw new HTTPError("Limit must be between 1 and 1000");

		const guilds = await Guild.find({
			where: {
				...(after ? { id: MoreThan(`${after}`) } : {}),
				...(query ? { name: ILike(`%${query}%`) } : {}),
			},
			take: limit,
		});

		res.send(guilds);
	},
);

//TODO: create default channel

router.post(
	"/",
	route({
		requestBody: "GuildCreateSchema",
		responses: {
			201: {
				body: "GuildCreateResponse",
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
		const body = req.body as GuildCreateSchema;
		const rights = await getRights(req.user_id);
		if (!rights.has("CREATE_GUILDS") && !rights.has("OPERATOR")) {
			throw new HTTPError(
				`You are missing the following rights CREATE_GUILDS or OPERATOR`,
				403,
			);
		}

		const { maxGuilds } = Config.get().limits.user;
		const guild_count = await Member.count({ where: { id: req.user_id } });
		// allow admins to bypass guild limits
		if (guild_count >= maxGuilds && !rights.has("OPERATOR")) {
			throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
		}

		let owner_id = req.user_id;

		// only admins can do this, is ignored otherwise
		if (body.owner_id && rights.has("OPERATOR")) {
			owner_id = body.owner_id;
		}

		const guild = await Guild.createGuild({
			...body,
			owner_id,
		});

		const { autoJoin } = Config.get().guild;
		if (autoJoin.enabled && !autoJoin.guilds?.length) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
		}

		await Member.addToGuild(req.user_id, guild.id);

		res.status(201).json(guild);
	},
);

export default router;
