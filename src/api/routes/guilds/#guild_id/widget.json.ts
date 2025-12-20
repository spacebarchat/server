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

import { randomString, route } from "@spacebar/api";
import { Channel, Config, DiscordApiErrors, Guild, Invite, Member, Permissions } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router: Router = Router({ mergeParams: true });

// Undocumented API notes:
// An invite is created for the widget_channel_id on request (only if an existing one created by the widget doesn't already exist)
// This invite created doesn't include an inviter object like user created ones and has a default expiry of 24 hours
// Missing user object information is intentional (https://github.com/discord/discord-api-docs/issues/1287)
// channels returns voice channel objects where @everyone has the CONNECT permission
// members (max 100 returned) is a sample of all members, and bots par invisible status, there exists some alphabetical distribution pattern between the members returned

// https://discord.com/developers/docs/resources/guild#get-guild-widget
// TODO: Cache the response for a guild for 5 minutes regardless of response
router.get(
    "/",
    route({
        responses: {
            200: {
                body: "GuildWidgetJsonResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params;

        const guild = await Guild.findOneOrFail({
            where: { id: guild_id },
            select: {
                channel_ordering: true,
                widget_channel_id: true,
                widget_enabled: true,
                presence_count: true,
                name: true,
            },
        });
        if (!guild.widget_enabled) throw DiscordApiErrors.EMBED_DISABLED;

        // Fetch existing widget invite for widget channel
        let invite = await Invite.findOne({
            where: { channel_id: guild.widget_channel_id },
        });

        if (guild.widget_channel_id && !invite) {
            // Create invite for channel if none exists
            // TODO: Refactor invite create code to a shared function
            const max_age = 86400; // 24 hours
            const expires_at = new Date(max_age * 1000 + Date.now());

            invite = await Invite.create({
                code: randomString(),
                temporary: false,
                uses: 0,
                max_uses: 0,
                max_age: max_age,
                expires_at,
                created_at: new Date(),
                guild_id,
                channel_id: guild.widget_channel_id,
                flags: 0,
            }).save();
        }

        // Fetch voice channels, and the @everyone permissions object
        const channels: { id: string; name: string; position: number }[] = [];

        (await Channel.getOrderedChannels(guild.id, guild)).filter((doc) => {
            // Only return channels where @everyone has the CONNECT permission
            if (doc.permission_overwrites === undefined || Permissions.channelPermission(doc.permission_overwrites, Permissions.FLAGS.CONNECT) === Permissions.FLAGS.CONNECT) {
                channels.push({
                    id: doc.id,
                    name: doc.name ?? "Unknown channel",
                    position: doc.position ?? 0,
                });
            }
        });

        // Fetch members
        // TODO: Understand how Discord's max 100 random member sample works, and apply to here (see top of this file)
        const members = await Member.find({ where: { guild_id: guild_id }, relations: { user: { sessions: true } } });
        const onlineMembers = members.filter((m) => m.user.sessions.filter((s) => (s.last_seen?.getTime() ?? 0) > Date.now() - 1000 * 60));
        const memberData = onlineMembers.map((x) => {
            return {
                id: x.id,
                username: x.user.username,
                discriminator: x.user.discriminator,
                avatar: null,
                status: "online", // TODO
                avatar_url: x.avatar
                    ? `${Config.get().cdn.endpointPublic}/guilds/${guild_id}/users/${x.id}/avatars/${x.avatar}.png`
                    : x.user.avatar
                      ? `${Config.get().cdn.endpointPublic}/avatars/${x.id}/${x.user.avatar}.png`
                      : `${Config.get().cdn.endpointPublic}/embed/avatars/${BigInt(x.id) % 6n}.png`,
            };
        });

        // Construct object to respond with
        const data = {
            id: guild_id,
            name: guild.name,
            instant_invite: invite?.code,
            channels: channels,
            members: memberData,
            member_count: members.length,
            presence_count: guild.presence_count || onlineMembers.length,
        };

        res.set("Cache-Control", "public, max-age=300");
        return res.json(data);
    },
);

export default router;
