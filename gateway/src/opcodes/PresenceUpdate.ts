import { WebSocket, Payload } from "@fosscord/gateway";
import { emitEvent, PresenceUpdateEvent, Session, User, Member, Role, Guild } from "@fosscord/util";
import { ActivitySchema } from "../schema/Activity";
import { check } from "./instanceOf";
import "missing-native-js-functions";
import { getRepository } from "typeorm";

export async function onPresenceUpdate(this: WebSocket, { d }: Payload) {
	check.call(this, ActivitySchema, d);
	const presence = d as ActivitySchema;
	const member = await Member.findOneOrFail({
		where: { id: this.user_id},
		relations: ["user", "roles", "guild", "guild.channels", "guild.roles", "guild.members"],
	});
    
	await Session.update(
		{ session_id: this.session_id },
		{ status: presence.status, activities: presence.activities }
	);
    const guild_id = member.guild_id;
    const guild = await Guild.findOneOrFail({ id: guild_id });
    const role = member.roles.first() || {id: guild_id};
    
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
//     const guild_members = await Member.find({
//         where: { guild_id: member.guild_id },
//         relations: ["roles", "user"],
//     });
    var gml_index = 0;
    // @ts-ignore
    let [members_online, members_offline] = partition(guild_members, (m: Member) => 
        m.user.sessions.length > 0
    );
    let total_online = members_online.length;
    const items = [] as any[];
    const groups = [] as any[];
    for (const gr of guild_roles) {
        var num = 0;
        // @ts-ignore
        const [role_members, other_members] = partition(members_online, (m: Member) =>
            m.roles.find((r) => r.id === gr.id)
        );

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
    
	await emitEvent ({
		event: "PRESENCE_UPDATE",
		guild_id,
		data: {
			user: member.user,//await User.getPublicUser(this.user_id),
            guild_id,
			activities: presence.activities,
			client_status: {web: presence.status}, // TODO:
			status: presence.status,
		},
	} as PresenceUpdateEvent);
    
    
	await emitEvent ({
		event: "PRESENCE_UPDATE",
		user_id: this.user_id,
		data: {
			user: member.user,//await User.getPublicUser(this.user_id),
			activities: presence.activities,
			client_status: {web: presence.status}, // TODO:
			status: presence.status,
		},
	} as PresenceUpdateEvent);
    /*await emitEvent({
        event: "GUILD_MEMBER_LIST_UPDATE",
        guild_id: member.guild_id,
        data: {
            online_count: total_online,
            member_count: member.guild.member_count,
            guild_id: member.guild_id,
            id: "everyone",
            groups: groups,
            ops: [
            {
                op: "DELETE",
                index: member.index
            },
            { 
                op: "UPDATE",
                index: member.index+1,
                item: {
                    member: {
                        user: member.user,
                        roles: [role.id],
                        presence: {
                            user: {
                                id: member.user.id,
                            },
                            activities: [],
                            client_status: "online", // TODO:
                            status: "online",
                        },
                        joined_at: member.joined_at,
                        hoisted_role: null,
                        premium_since: member.premium_since,
                        deaf: false,
                        mute: false,
                    },
                }
            },
            {
                op: "INSERT",
                index: member.index,
                item:{
                    member: {
                        user: member.user,
                        roles: [role.id],
                        presence: {
                            user: {
                                id: member.user.id,
                            },
                            activities: [],
                            client_status: "online", // TODO:
                            status: "online",
                        },
                        joined_at: member.joined_at,
                        hoisted_role: null,
                        premium_since: member.premium_since,
                        deaf: false,
                        mute: false,
                    }
                }
            },]
        },
    });*/
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