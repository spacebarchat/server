/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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
import { Snowflake, User, Message, Member, Channel, Permissions, timePromise } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { In } from "typeorm";

const router: Router = Router({ mergeParams: true });

router.get(
	"",
	route({
		responses: {
			200: {
				body: "MessageListResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	// AFAICT this endpoint doesn't list DMs
	async (req: Request, res: Response) => {
		const limit = req.query.limit && !isNaN(Number(req.query.limit)) ? Number(req.query.limit) : 50;
		const everyone = !!req.query.everyone;
		const roles = !!req.query.roles;

		const user = await User.findOneOrFail({
			where: { id: req.user_id },
		});

		const memberships = await Member.find({
			where: { id: req.user_id },
			select: {
				guild_id: true,
				id: true,
				communication_disabled_until: true,
				roles: {
					// We don't want to include all guild roles, as this could cause a lot more explosive behavior
					id: true,
					position: true,
					permissions: true,
					mentionable: true, // cause we can skip querying for unmentionable roles
				},
				guild: {
					id: true,
					owner_id: true,
				},
			},
			relations: ["guild", "roles"],
		});

		const channels = await Channel.find({
			where: {
				guild_id: In(memberships.map((m) => m.guild_id)),
			},
			select: { id: true, guild_id: true, permission_overwrites: true },
		});

		const visibleChannels = channels.filter((c) => {
			const member = memberships.find((m) => m.guild_id === c.guild_id)!;
			return Permissions.finalPermission({
				user: { id: member.id, roles: member.roles.map((r) => r.id), communication_disabled_until: member.communication_disabled_until, flags: 0 },
				guild: { id: member.guild.id, owner_id: member.guild.owner_id!, roles: member.guild.roles },
				channel: c,
			}).has("VIEW_CHANNEL");
		});
		const visibleChannelIds = visibleChannels.map((c) => c.id);
		const ownedMentionableRoleIds = memberships.reduce((acc, m) => {
			acc.push(...m.roles.filter((r) => r.mentionable).map((r) => r.id));
			return acc;
		}, [] as Snowflake[]);

		const [
			{ result: userMentions, elapsed: userMentionQueryTime },
			{ result: roleMentions, elapsed: roleMentionQueryTime },
			{ result: everyoneMentions, elapsed: everyoneMentionQueryTime },
		] = await Promise.all([
			await timePromise(() =>
				Message.find({
					where: {
						channel_id: In(visibleChannelIds),
						mentions: { id: user.id },
					},
					select: {
						id: true,
						timestamp: true,
					},
					order: {
						timestamp: "DESC",
					},
					take: limit ? Number(limit) : 50,
				}),
			),
			await timePromise(() =>
				!roles
					? Promise.resolve([])
					: Message.find({
							where: {
								channel_id: In(visibleChannelIds),
								mention_roles: { id: In(ownedMentionableRoleIds) },
							},
							select: {
								id: true,
								timestamp: true,
							},
							order: {
								timestamp: "DESC",
							},
							take: limit ? Number(limit) : 50,
						}),
			),
			await timePromise(() =>
				!everyone
					? Promise.resolve([])
					: Message.find({
							where: {
								channel_id: In(visibleChannelIds),
								mention_everyone: true,
							},
							select: {
								id: true,
								timestamp: true,
							},
							order: {
								timestamp: "DESC",
							},
							take: limit ? Number(limit) : 50,
						}),
			),
		]);

		const allMentions = [...userMentions, ...roleMentions, ...everyoneMentions];
		console.log(`[Inbox/mentions] User ${user.id} query results: totalRecs=${allMentions.length} | user=${userMentions.length} (took ${userMentionQueryTime}ms), role=${roleMentions.length} (took ${roleMentionQueryTime}ms), everyone=${everyoneMentions.length} (took ${everyoneMentionQueryTime}ms)`);

		return res.json(
			allMentions
				.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
				.distinctBy((m) => m.id)
				.slice(0, limit),
		);
	},
);

export default router;
