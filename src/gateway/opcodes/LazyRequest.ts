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

import { getDatabase, getPermission, listenEvent, Member, Role, Session, User, Presence, Channel, Permissions, arrayPartition } from "@spacebar/util";
import { WebSocket, Payload, handlePresenceUpdate, OPCODES, Send } from "@spacebar/gateway";
import murmur from "murmurhash-js/murmurhash3_gc";
import { check } from "./instanceOf";
import { LazyRequestSchema } from "@spacebar/schemas";

// TODO: only show roles/members that have access to this channel
// TODO: config: to list all members (even those who are offline) sorted by role, or just those who are online
// TODO: rewrite typeorm

function getMostRelevantSession(sessions: Session[]) {
    const statusMap = {
        online: 0,
        idle: 1,
        dnd: 2,
        invisible: 3,
        offline: 4,
    };
    // sort sessions by relevance
    sessions = sessions.sort((a, b) => {
        return statusMap[a.status] - statusMap[b.status] + ((a.activities?.length ?? 0) - (b.activities?.length ?? 0)) * 2;
    });

    return sessions[0];
}

async function getMembers(guild_id: string, range: [number, number]) {
    if (!Array.isArray(range) || range.length !== 2) {
        throw new Error("range is not a valid array");
    }

    let members: Member[] = [];
    try {
        members =
            (await getDatabase()
                ?.getRepository(Member)
                .createQueryBuilder("member")
                .where("member.guild_id = :guild_id", { guild_id })
                .leftJoinAndSelect("member.roles", "role")
                .leftJoinAndSelect("member.user", "user")
                .leftJoinAndSelect("user.sessions", "session")
                .addSelect("user.settings")
                .addSelect("CASE WHEN session.status IS NULL OR session.status = 'offline' OR session.status = 'invisible' THEN 0 ELSE 1 END", "_status")
                .orderBy("_status", "DESC")
                .addOrderBy("role.position", "DESC")
                .addOrderBy("user.username", "ASC")
                .offset(Number(range[0]) || 0)
                .limit(Number(range[1]) || 100)
                .getMany()) ?? [];
    } catch (e) {
        console.error(`LazyRequest`, e);
    }

    if (!members || !members.length) {
        return {
            items: [],
            groups: [],
            range: [],
            members: [],
        };
    }

    const groups = [];
    const items = [];
    const membersByRole = new Map<string, Member[]>();
    for (const m of members) {
        for (const r of m.roles) {
            const arr = membersByRole.get(r.id);
            if (arr) arr.push(m);
            else membersByRole.set(r.id, [m]);
        }
    }

    const member_roles: Role[] = [];
    const seenRoles = new Set<string>();
    for (const m of members) {
        for (const r of m.roles) {
            if (!seenRoles.has(r.id)) {
                seenRoles.add(r.id);
                member_roles.push(r);
            }
        }
    }

    const defaultIndex = member_roles.findIndex((x) => x.id === x.guild_id);
    if (defaultIndex !== -1) {
        const [defRole] = member_roles.splice(defaultIndex, 1);
        member_roles.push(defRole);
    }

    const offlineItems: any[] = [];

    for (const role of member_roles) {
        const role_members = membersByRole.get(role.id) || [];
        const group = {
            count: role_members.length,
            id: role.id === guild_id ? "online" : role.id,
        };

        items.push({ group });
        groups.push(group);

        for (const member of role_members) {
            const roles = member.roles.filter((x: Role) => x.id !== guild_id).map((x: Role) => x.id);

            const session: Session | undefined = getMostRelevantSession(member.user.sessions);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (session?.status == "unknown") {
                session.status = member?.user?.settings?.status || "online";
            }

            const item = {
                member: {
                    ...member,
                    roles,
                    user: member.user.toPublicUser(),
                    presence: {
                        activities: session?.activities || [],
                        user: { id: member.user.id },
                        client_status: session?.client_status,
                        status: session?.status,
                    },
                },
            };

            if (!session || session.status == "invisible" || session.status == "offline") {
                item.member.presence.status = "offline";
                offlineItems.push(item);
                group.count--;
                continue;
            }

            items.push(item);
        }
    }

    if (offlineItems.length) {
        const group = {
            count: offlineItems.length,
            id: "offline",
        };
        items.push({ group });
        groups.push(group);

        items.push(...offlineItems);
    }

    return {
        items,
        groups,
        range,
        members: items.map((x) => ("member" in x ? { ...x.member, settings: undefined } : undefined)).filter((x) => !!x),
    };
}

async function subscribeToMemberEvents(this: WebSocket, user_id: string) {
    if (this.events[user_id]) return false; // already subscribed as friend
    if (this.member_events[user_id]) return false; // already subscribed in member list
    this.member_events[user_id] = await listenEvent(user_id, handlePresenceUpdate.bind(this), this.listen_options);
    return true;
}

export async function onLazyRequest(this: WebSocket, { d }: Payload) {
    const startTime = Date.now();
    // TODO: check data
    check.call(this, LazyRequestSchema, d);
    const { guild_id, typing, channels, activities, members } = d as LazyRequestSchema;

    if (members) {
        // Client has requested a PRESENCE_UPDATE for specific member

        await Promise.all([
            members.map(async (x) => {
                if (!x) return;
                const didSubscribe = await subscribeToMemberEvents.call(this, x);
                if (!didSubscribe) return;

                // if we didn't subscribe just now, this is a new subscription
                // and we should send a PRESENCE_UPDATE immediately

                const sessions = await Session.find({ where: { user_id: x } });
                const session = getMostRelevantSession(sessions);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (session?.status == "unknown") session.status = "online";
                const user = await User.getPublicUser(x);

                return Send(this, {
                    op: OPCODES.Dispatch,
                    s: this.sequence++,
                    t: "PRESENCE_UPDATE",
                    d: {
                        user: user,
                        activities: session?.activities || [],
                        client_status: session?.client_status,
                        status: session?.getPublicStatus() || "offline",
                    } as Presence,
                });
            }),
        ]);

        if (!channels) return;
    }

    if (!channels) return;

    const channel_id = Object.keys(channels || {})[0];
    if (!channel_id) return;

    const permissions = await getPermission(this.user_id, guild_id, channel_id);
    permissions.hasThrow("VIEW_CHANNEL");

    const ranges = channels[channel_id];
    if (!Array.isArray(ranges)) throw new Error("Not a valid Array");

    const member_count = await Member.count({ where: { guild_id } });
    const ops = await Promise.all(ranges.map((x) => getMembers(guild_id, x as [number, number])));

    let list_id = "everyone";

    const channel = await Channel.findOneOrFail({
        where: { id: channel_id },
    });
    if (channel.permission_overwrites) {
        const perms: string[] = [];

        channel.permission_overwrites.forEach((overwrite) => {
            const { id, allow, deny } = overwrite;

            if (BigInt(allow) & Permissions.FLAGS.VIEW_CHANNEL) perms.push(`allow:${id}`);
            else if (BigInt(deny) & Permissions.FLAGS.VIEW_CHANNEL) perms.push(`deny:${id}`);
        });

        if (perms.length > 0) {
            list_id = murmur(perms.sort().join(",")).toString();
        }
    }

    // TODO: unsubscribe member_events that are not in op.members

    const memberIds: string[] = [];
    ops.forEach((op) => {
        op.members.forEach((member) => {
            if (member?.user?.id) memberIds.push(member.user.id);
        });
    });
    const uniqueIds = [...new Set(memberIds)];
    for (const id of uniqueIds) {
        await subscribeToMemberEvents.call(this, id);
    }

    const groups = [...new Set(ops.map((x) => x.groups).flat())];

    await Send(this, {
        op: OPCODES.Dispatch,
        s: this.sequence++,
        t: "GUILD_MEMBER_LIST_UPDATE",
        d: {
            ops: ops.map((x) => ({
                items: x.items,
                op: "SYNC",
                range: x.range,
            })),
            online_count: member_count - (groups.find((x) => x.id == "offline")?.count ?? 0),
            member_count,
            id: list_id,
            guild_id,
            groups,
        },
    });

    console.log(`[Gateway/${this.user_id}] LAZY_REQUEST ${guild_id} ${channel_id} took ${Date.now() - startTime}ms`);
}
