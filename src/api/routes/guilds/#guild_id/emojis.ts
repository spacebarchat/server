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
	Emoji,
	EmojiCreateSchema,
	EmojiModifySchema,
	GuildEmojisUpdateEvent,
	Member,
	Snowflake,
	User,
	emitEvent,
	handleFile,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "APIEmojiArray",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;

		await Member.IsInGuildOrFail(req.user_id, guild_id);

		const emojis = await Emoji.find({
			where: { guild_id: guild_id },
			relations: ["user"],
		});

		return res.json(emojis);
	},
);

router.get(
	"/:emoji_id",
	route({
		responses: {
			200: {
				body: "Emoji",
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
		const { guild_id, emoji_id } = req.params;

		await Member.IsInGuildOrFail(req.user_id, guild_id);

		const emoji = await Emoji.findOneOrFail({
			where: { guild_id: guild_id, id: emoji_id },
			relations: ["user"],
		});

		return res.json(emoji);
	},
);

router.post(
	"/",
	route({
		requestBody: "EmojiCreateSchema",
		permission: "MANAGE_EMOJIS_AND_STICKERS",
		responses: {
			201: {
				body: "Emoji",
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
		const { guild_id } = req.params;
		const body = req.body as EmojiCreateSchema;

		const id = Snowflake.generate();
		const emoji_count = await Emoji.count({
			where: { guild_id: guild_id },
		});
		const { maxEmojis } = Config.get().limits.guild;

		if (emoji_count >= maxEmojis)
			throw DiscordApiErrors.MAXIMUM_NUMBER_OF_EMOJIS_REACHED.withParams(
				maxEmojis,
			);
		if (body.require_colons == null) body.require_colons = true;

		const user = await User.findOneOrFail({ where: { id: req.user_id } });
		await handleFile(`/emojis/${id}`, body.image);

		const mimeType = body.image.split(":")[1].split(";")[0];
		const emoji = await Emoji.create({
			id: id,
			guild_id: guild_id,
			name: body.name,
			require_colons: body.require_colons ?? undefined, // schema allows nulls, db does not
			user: user,
			managed: false,
			animated:
				mimeType == "image/gif" ||
				mimeType == "image/apng" ||
				mimeType == "video/webm",
			available: true,
			roles: [],
		}).save();

		await emitEvent({
			event: "GUILD_EMOJIS_UPDATE",
			guild_id: guild_id,
			data: {
				guild_id: guild_id,
				emojis: await Emoji.find({ where: { guild_id: guild_id } }),
			},
		} as GuildEmojisUpdateEvent);

		return res.status(201).json(emoji);
	},
);

router.patch(
	"/:emoji_id",
	route({
		requestBody: "EmojiModifySchema",
		permission: "MANAGE_EMOJIS_AND_STICKERS",
		responses: {
			200: {
				body: "Emoji",
			},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { emoji_id, guild_id } = req.params;
		const body = req.body as EmojiModifySchema;

		const emoji = await Emoji.create({
			...body,
			id: emoji_id,
			guild_id: guild_id,
		}).save();

		await emitEvent({
			event: "GUILD_EMOJIS_UPDATE",
			guild_id: guild_id,
			data: {
				guild_id: guild_id,
				emojis: await Emoji.find({ where: { guild_id: guild_id } }),
			},
		} as GuildEmojisUpdateEvent);

		return res.json(emoji);
	},
);

router.delete(
	"/:emoji_id",
	route({
		permission: "MANAGE_EMOJIS_AND_STICKERS",
		responses: {
			204: {},
			403: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { emoji_id, guild_id } = req.params;

		await Emoji.delete({
			id: emoji_id,
			guild_id: guild_id,
		});

		await emitEvent({
			event: "GUILD_EMOJIS_UPDATE",
			guild_id: guild_id,
			data: {
				guild_id: guild_id,
				emojis: await Emoji.find({ where: { guild_id: guild_id } }),
			},
		} as GuildEmojisUpdateEvent);

		res.sendStatus(204);
	},
);

export default router;
