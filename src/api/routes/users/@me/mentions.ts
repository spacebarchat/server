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
import { Snowflake, User, Message, Member, Channel, Permissions, timePromise, NewUrlUserSignatureData, Stopwatch, Attachment } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { In, LessThan, FindOptionsWhere } from "typeorm";

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
        const limit = req.query.limit && !isNaN(Number(req.query.limit)) ? Number(req.query.limit) : 25;
        const everyone = req.query.everyone !== undefined ? Boolean(req.query.everyone) : true;
        const roles = req.query.roles !== undefined ? Boolean(req.query.roles) : true;
        const before = req.query.before !== undefined ? String(req.query.before as string) : undefined;
        const guild_id = req.query.guild_id !== undefined ? req.query.guild_id : undefined;

        const user = req.user;

        const memberships = await Member.find({
            where: { id: req.user_id, ...(guild_id === undefined ? {} : { guild_id: String(guild_id) }) },
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
                guild: { id: member.guild.id, owner_id: member.guild.owner_id!, roles: member.roles },
                channel: c,
            }).has("VIEW_CHANNEL");
        });

        const visibleChannelIds = visibleChannels.map((c) => c.id);
        const ownedMentionableRoleIds = memberships.reduce((acc, m) => {
            acc.push(...m.roles.filter((r) => r.mentionable).map((r) => r.id));
            return acc;
        }, [] as Snowflake[]);

        const whereQuery: FindOptionsWhere<Message>[] = [
            {
                channel_id: In(visibleChannelIds),
                mentions: { id: user.id },
                id: before ? LessThan(before) : undefined,
            },
        ];
        if (everyone) {
            whereQuery.push({
                channel_id: In(visibleChannelIds),
                mention_everyone: true,
                id: before ? LessThan(before) : undefined,
            });
        }
        if (roles) {
            whereQuery.push({
                channel_id: In(visibleChannelIds),
                mention_roles: { id: In(ownedMentionableRoleIds) },
                id: before ? LessThan(before) : undefined,
            });
        }

        const sw = Stopwatch.startNew();
        const finalMessages = (
            await Message.find({
                where: whereQuery,
                order: { timestamp: "DESC" },
                relations: [
                    "author",
                    "webhook",
                    "application",
                    "mentions",
                    "mention_roles",
                    "mention_channels",
                    "sticker_items",
                    "attachments",
                    "referenced_message",
                    "referenced_message.author",
                    "referenced_message.webhook",
                    "referenced_message.application",
                    "referenced_message.mentions",
                    "referenced_message.mention_roles",
                    "referenced_message.mention_channels",
                    "referenced_message.sticker_items",
                    "referenced_message.attachments",
                ],
                take: limit,
            })
        ).map((m) => {
            return {
                ...m.toJSON(),
                attachments: m.attachments?.map((attachment: Attachment) =>
                    Attachment.prototype.signUrls.call(
                        attachment,
                        new NewUrlUserSignatureData({
                            ip: req.ip,
                            userAgent: req.headers["user-agent"] as string,
                        }),
                    ),
                ),
            };
        });

        console.log(`[Inbox/mentions] User ${user.id} fetched full message data for ${finalMessages.length} messages in ${sw.elapsed().totalMilliseconds}ms`);

        return res.json(finalMessages);
    },
);

export default router;
