import { WebSocket } from "@fosscord/gateway";
import {
	emitEvent,
	PresenceUpdateEvent,
	PrivateSessionProjection,
	Session,
	SessionsReplace,
    Member,
    Role,
	User,
} from "@fosscord/util";
import "missing-native-js-functions";
import { getRepository } from "typeorm";

export async function Close(this: WebSocket, code: number, reason: string) {
    const member_before = await Member.findOneOrFail({
        where: { id: this.user_id},
        relations: ["user", "roles", "guild", "guild.channels", "guild.roles", "guild.members"],
    });
    const guild_roles_b = await Role.find({
        where: { guild_id: member_before.guild_id },
        select: ["id"],
        order: {position: "DESC"},
    });
    let guild_members_before = await getRepository(Member)
            .createQueryBuilder("member")
            .where("member.guild_id = :guild_id", { guild_id: member_before.guild_id })
            .leftJoinAndSelect("member.roles", "role")
            .leftJoinAndSelect("member.user", "user")
            .leftJoinAndSelect("user.sessions", "session")
            .addSelect(
                "CASE WHEN session.status = 'offline' THEN 0 ELSE 1 END",
                "_status"
                )
            .orderBy("role.position", "DESC")
            .addOrderBy("_status", "DESC")
            .addOrderBy("user.username", "ASC")
            .getMany();
    const items_before = [] as any[];
    const groups_before = [] as any[];
    // @ts-ignore
    let [members_online_before, members_offline_before] = partition(guild_members_before, (m: Member) => 
        m.user.sessions.length > 0
        );
    for (const gr of guild_roles_b) {
        // @ts-ignore
        const [role_members, other_members] = partition(members_online_before, (m: Member) =>
            m.roles.find((r) => r.id === gr.id)
            );

        if(role_members.length){     
            const group = {
                count: role_members.length,
                id: gr.id === member_before.guild_id ? "online" : gr.id,
            };
            items_before.push({ group });
            groups_before.push(group);

            for (const rm of role_members) {
                const gmr = rm.roles.first() || {id: "online"};
                if(gmr.id === gr.id){
                    const roles = rm.roles
                    .filter((x: Role) => x.id !== member_before.guild_id)
                    .map((x: Role) => x.id);

                    const session = rm.user.sessions.first();

                    // TODO: properly mock/hide offline/invisible status
                    items_before.push({
                        member: {
                            ...rm,
                            roles,
                            user: { ...rm.user, sessions: undefined },
                            presence: {
                                ...session,
                                activities: session?.activities || [],
                                user: { id: rm.user.id },
                            },
                        },
                    });
                }
            }
        }
        members_online_before = other_members;
    }
    const group = {
        count: members_offline_before.length,
        id: "offline"
    }
    items_before.push({group});
    groups_before.push(group);

    for (const m_on of members_offline_before) {
        const roles = m_on.roles
                    .filter((x: Role) => x.id !== member_before.guild_id)
                    .map((x: Role) => x.id);

        const session = m_on.user.sessions.first();

        // TODO: properly mock/hide offline/invisible status
        items_before.push({
            member: {
                ...m_on,
                roles,
                user: { ...m_on.user, sessions: undefined },
                presence: {
                    ...session,
                    activities: session?.activities || [],
                    user: { id: m_on.user.id },
                },
            },
        });
    }
	console.log("[WebSocket] closed", code, reason);
	if (this.heartbeatTimeout) clearTimeout(this.heartbeatTimeout);
	if (this.readyTimeout) clearTimeout(this.readyTimeout);
	this.deflate?.close();
	this.removeAllListeners();

	if (this.session_id) {
		await Session.delete({ session_id: this.session_id });
		const sessions = await Session.find({
			where: { user_id: this.user_id },
			select: PrivateSessionProjection,
		});
		await emitEvent({
			event: "SESSIONS_REPLACE",
			user_id: this.user_id,
			data: sessions,
		} as SessionsReplace);
		const session = sessions.first() || {
			activities: [],
			client_info: {},
			status: "offline",
		};

		await emitEvent({
			event: "PRESENCE_UPDATE",
			user_id: this.user_id,
			data: {
				user: await User.getPublicUser(this.user_id),
				activities: session.activities,
				client_status: session?.client_info,
				status: session.status,
			},
		} as PresenceUpdateEvent);
            
        const member = await Member.findOneOrFail({
            where: { id: this.user_id},
            relations: ["user", "roles", "guild", "guild.channels", "guild.roles", "guild.members"],
        });
        
            emitEvent({
                event: "PRESENCE_UPDATE",
                guild_id: member.guild_id,
                data: {
                    guild_id: member.guild_id,
                    user: await User.getPublicUser(this.user_id),
                    activities: session.activities,
                    client_status: session?.client_info,
                    status: session.status,
                },
            } as PresenceUpdateEvent);

            let guild_members = await getRepository(Member)
                .createQueryBuilder("member")
                .where("member.guild_id = :guild_id", { guild_id: member.guild_id })
                .leftJoinAndSelect("member.roles", "role")
                .leftJoinAndSelect("member.user", "user")
                .leftJoinAndSelect("user.sessions", "session")
                .addSelect(
                    "CASE WHEN session.status = 'offline' THEN 0 ELSE 1 END",
                    "_status"
                )
                .orderBy("role.position", "DESC")
                .addOrderBy("_status", "DESC")
                .addOrderBy("user.username", "ASC")
                .getMany();
                    
            const guild_roles = await Role.find({
                where: { guild_id: member.guild_id },
                select: ["id"],
                order: {position: "DESC"},
            });
		    var gml_index = 0;
		    var index_online = 0;
            var contains_group = 0;
            var contains_group_new = 0;
            // @ts-ignore
            let [members_online, members_offline] = partition(guild_members, (m: Member) => 
                m.user.sessions.length > 0
            );
            const items = [] as any[];
            const items_no_gr = [] as any[];
            const groups = [] as any[];
            let original_online = members_online;
            let total_online = members_online.length;
            for (const gr of guild_roles) {
                // @ts-ignore
                const [role_members, other_members] = partition(members_online, (m: Member) =>
                    m.roles.find((r) => r.id === gr.id)
                );
                
                if(role_members.length){     
                    const group = {
                        count: role_members.length,
                        id: gr.id === member.guild_id ? "online" : gr.id,
                    };
                    items.push({ group });
                    groups.push(group);

                    for (const rm of role_members) {
                        const gmr = rm.roles.first() || {id: "online"};
                        if(gmr.id === gr.id){
                            const roles = rm.roles
                                .filter((x: Role) => x.id !== member.guild_id)
                                .map((x: Role) => x.id);

                            const session = rm.user.sessions.first();

                            // TODO: properly mock/hide offline/invisible status
                            items_no_gr.push({
                                    member: {
                                        ...rm,
                                        roles,
                                        user: { ...rm.user, sessions: undefined },
                                        presence: {
                                            ...session,
                                            activities: session?.activities || [],
                                            user: { id: rm.user.id },
                                        },
                                    },
                                });
                            items.push({
                                member: {
                                    ...rm,
                                    roles,
                                    user: { ...rm.user, sessions: undefined },
                                    presence: {
                                        ...session,
                                        activities: session?.activities || [],
                                        user: { id: rm.user.id },
                                    },
                                },
                            });
                        }
                    }
                }
                members_online = other_members;
            }
            const group = {
                count: members_offline.length,
                id: "offline"
            }
            items.push({group});
            groups.push(group);
            for (const m_off of members_offline) {
                const roles = m_off.roles
                            .filter((x: Role) => x.id !== member.guild_id)
                            .map((x: Role) => x.id);

                const session = m_off.user.sessions.first();

                // TODO: properly mock/hide offline/invisible status
                items_no_gr.push({
                    member: {
                        ...m_off,
                        roles,
                        user: { ...m_off.user, sessions: undefined },
                        presence: {
                            ...session,
                            activities: session?.activities || [],
                            user: { id: m_off.user.id },
                        },
                    },
                });
                items.push({
                    member: {
                        ...m_off,
                        roles,
                        user: { ...m_off.user, sessions: undefined },
                        presence: {
                            ...session,
                            activities: session?.activities || [],
                            user: { id: m_off.user.id },
                        },
                    },
                });
            }
		    gml_index = items.map(object => object.member? object.member.id : false).indexOf(this.user_id);
		    const role = member.roles.first() || {id: member.guild_id};
			index_online = items_before.map(object => object.member? object.member.id : false).indexOf(this.user_id);
            contains_group = items_before.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
            contains_group_new = items.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
            var ops = [];
             if(contains_group == -1){
                 ops.push({
                     op: "INSERT", // INSERT new group, if not existing
                     item: {
                         group: {
                             id: role.id,
                             count: 1
                         }
                     },
                     index: contains_group_new,
                 });
             }
             
             if(contains_group_new == -1){
                 ops.push({
                     op: "DELETE", // DELETE group
                     index: contains_group,
                 });
             }
             
            ops.push({
                op: "DELETE",
                index: index_online//DELETE USER FROM GROUP
            });
            ops.push({
                op: "INSERT", // INSERT USER INTO GROUP, PROBABLY ISSUE WITH INDEX NUM WOULD NEED TO FIGURE THIS OUT.
                index: gml_index,
                item:{
                    member: {
                        user: member.user,
                        roles: [role.id],
                        presence: {
                            user: {
                                id: member.user.id,
                            },
                            activities: [],
                            client_status: {web: session?.status}, // TODO:
                            status: session?.status,
                        },
                        joined_at: member.joined_at,
                        hoisted_role: null,
                        premium_since: member.premium_since,
                        deaf: false,
                        mute: false,
                    }
                }
            });

            
		    await emitEvent({
		        event: "GUILD_MEMBER_LIST_UPDATE",
		        guild_id: member.guild_id,
		        data: {
		            online_count: total_online,
		            member_count: member.guild.member_count,
		            guild_id: member.guild_id,
		            id: "everyone",
		            groups: groups,
		            ops: ops
		        },
		    });
        };
	}
function partition<T>(array: T[], isValid: Function) {
    // @ts-ignore
    return array.reduce(
        // @ts-ignore
        ([pass, fail], elem) => {
            return isValid(elem)
                ? [[...pass, elem], fail]
                : [pass, [...fail, elem]];
        },
        [[], []]
    );
}
