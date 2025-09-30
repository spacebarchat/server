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
	Emoji,
	APIErrorResponse,
	DiscordApiErrors,
	EmojiSourceResponse,
	Guild,
	Member,
	EmojiGuild,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "EmojiSourceResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { emoji_id } = req.params;

		const emoji = await Emoji.findOne({ where: { id: emoji_id } });
		if (!emoji) {
			res.status(404).json({
				code: DiscordApiErrors.UNKNOWN_EMOJI.code,
				message: `No emoji with ID ${emoji_id} appear to exist. Are you sure you didn't mistype it?`,
				errors: {},
			} as APIErrorResponse);
			return;
		}

		// TODO: emojis can be owned by applications these days, account for this when we get there?
		res.json({
			type: "GUILD",
			guild: {
				...(await Guild.findOne({
					where: {
						id: emoji.guild_id,
					},
					select: {
						id: true,
						name: true,
						icon: true,
						description: true,
						features: true,
						emojis: true,
						premium_tier: true,
						premium_subscription_count: true,
					},
				})),
				approximate_member_count: await Member.countBy({
					guild_id: emoji.guild_id,
				}),
				approximate_presence_count: await Member.countBy({
					guild_id: emoji.guild_id,
					user: {
						sessions: {
							status: "online",
						},
					},
				}),
			} as EmojiGuild,
		} as EmojiSourceResponse);
	},
);

export default router;
