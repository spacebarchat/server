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
import { Channel, ChannelDeleteEvent, ChannelRecipientRemoveEvent, emitEvent, Emoji, Guild, InstanceBan, Member, Recipient, Sticker, User, UserDeleteEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { ChannelType, InstanceUserDeleteSchema, PrivateUserProjection } from "@spacebar/schemas";
import { Not } from "typeorm";

const router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		right: "MANAGE_USERS",
		requestBody: "InstanceUserDeleteSchema",
		responses: {
			204: {},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as InstanceUserDeleteSchema | undefined;
		const user = await User.findOneOrFail({
			where: { id: req.params.user_id },
			select: [...PrivateUserProjection, "data"],
		});

		await InstanceBan.create({ user_id: user.id, reason: body?.reason ?? "<legacy instance ban API - no reason specified>" }).save();

		// prevent bugginess with clients - delete all DMs, only having half of the conversation is quite useless anyhow
		const dmChannels = await user.getDmChannels();
		for (const channel of dmChannels) {
			console.log(`[Instance ban] Deleting DM channel ${channel.id} for user ${user.id}`);
			await emitEvent({
				event: "CHANNEL_DELETE",
				data: channel.toJSON(),
				channel_id: channel.id,
			} as ChannelDeleteEvent);
			await Recipient.delete({ channel_id: channel.id });
			await Channel.deleteChannel(channel);
		}

		//leave all group channels
		const groupChannels = await Channel.find({
			where: { type: ChannelType.GROUP_DM },
			relations: ["recipients"],
			select: {
				id: true,
				owner_id: true,
				recipients: {
					id: true,
					user_id: true,
				},
			},
		});

		await Promise.all(
			groupChannels.map(async (channel) => {
				const recipient = channel.recipients!.find((r) => r.user_id === user.id);
				if (recipient) {
					await Recipient.delete({ id: recipient.id });
					await emitEvent({
						event: "CHANNEL_RECIPIENT_REMOVE",
						data: {
							user: user.toPublicUser(),
							channel_id: channel.id,
						},
						channel_id: channel.id,
					} as ChannelRecipientRemoveEvent);
					console.log(`[Instance ban] Removed user ${user.id} from group channel ${channel.id}`);
				}

				// if no recipients remain, delete the channel
				const remainingRecipients = await Recipient.find({ where: { channel_id: channel.id } });
				if (remainingRecipients.length === 0) {
					await emitEvent({
						event: "CHANNEL_DELETE",
						data: channel.toJSON(),
						channel_id: channel.id,
					} as ChannelDeleteEvent);
					await Channel.deleteChannel(channel);
					console.log(`[Instance ban] Deleted empty group channel ${channel.id}`);
				} else {
					// otherwise, if the banned user was the owner, reassign ownership
					if (channel.owner_id === user.id) {
						channel.owner_id = remainingRecipients[0].user_id;
						await channel.save();
						console.log(`[Instance ban] Reassigned ownership of group channel ${channel.id} to user ${channel.owner_id}`);
					}
				}
			}),
		);

		// change ownership on guilds
		const guilds = await Guild.find({ where: { owner_id: req.params.user_id } });
		await Promise.all(
			guilds.map(async (guild) => {
				const members = await Member.find({
					where: { guild_id: guild.id, id: Not(req.params.user_id) },
					relations: { roles: true },
					select: { id: true, roles: { id: true, position: true } },
				});
				const sortedMembers = members
					.filter((m) => m.id !== req.params.user_id)
					.sort((a, b) => {
						const aHighestRole = a.roles.reduce((prev, curr) => (curr.position > prev.position ? curr : prev), { position: -1 } as { position: number });
						const bHighestRole = b.roles.reduce((prev, curr) => (curr.position > prev.position ? curr : prev), { position: -1 } as { position: number });
						return bHighestRole.position - aHighestRole.position;
					});
				if (sortedMembers.length === 0) {
					// no members left, delete guild
					await guild.remove();
					console.log(`[Instance ban] Deleted guild ${guild.id} as user ${user.id} was the last member`);
				} else {
					// assign new owner
					guild.owner_id = sortedMembers[0].id;
					await guild.save();
					console.log(`[Instance ban] Transferred ownership of guild ${guild.id} to user ${guild.owner_id}`);

					// safety - reassign emojis/stickers owned by the old owner
					const stickers = await Sticker.find({ where: { guild_id: guild.id, user_id: req.params.user_id } });
					await Promise.all(
						stickers.map(async (sticker) => {
							sticker.user_id = guild.owner_id;
							await sticker.save();
							console.log(`[Instance ban] Reassigned sticker ${sticker.id} ownership to user ${guild.owner_id}`);
						}),
					);

					const emojis = await Emoji.find({ where: { guild_id: guild.id, user_id: req.params.user_id } });
					await Promise.all(
						emojis.map(async (emoji) => {
							emoji.user_id = guild.owner_id!;
							await emoji.save();
							console.log(`[Instance ban] Reassigned emoji ${emoji.id} ownership to user ${guild.owner_id}`);
						}),
					);
				}
			}),
		);

		const members = await Member.find({ where: { id: req.params.user_id } });
		await Promise.all([...members.map((member) => Member.removeFromGuild(member.id, member.guild_id)), User.delete({ id: req.params.user_id })]);

		// TODO: respect intents as USER_DELETE has potential to cause privacy issues
		await emitEvent({
			event: "USER_DELETE",
			user_id: req.user_id,
			data: { user_id: req.params.user_id },
		} as UserDeleteEvent);

		res.sendStatus(204);
	},
);

export default router;
