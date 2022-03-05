import { WebSocket, Payload } from "@fosscord/gateway";
import { emitEvent, PresenceUpdateEvent, Session, User, Member, Role, Guild,Sorting } from "@fosscord/util";
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
    let sorted = await Sorting(member, guild_roles,guild_members);
    let items = [] as any[];
    let groups = [] as any[];
    items = sorted.items;
    groups = sorted.groups;
    let total_online = sorted.total_online;
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
