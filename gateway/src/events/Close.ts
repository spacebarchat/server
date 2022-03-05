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
    Sorting
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
    let sorted = await Sorting(member_before, guild_roles_b,guild_members_before);
    let items_before = [] as any[];
    let groups_before = [] as any[];
    items_before = sorted.items;
    groups_before = sorted.groups;
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
		    let gml_index = 0;
		    let index_online = 0;
            let contains_group = 0;
            let contains_group_new = 0;
            let sorted = await Sorting(member, guild_roles,guild_members);
            let items = [] as any[];
            let groups = [] as any[];
            items = sorted.items;
            groups = sorted.groups;
            let total_online = sorted.total_online;
		    gml_index = items.map(object => object.member? object.member.id : false).indexOf(this.user_id);
		    const role = member.roles.first() || {id: member.guild_id};
			index_online = items_before.map(object => object.member? object.member.id : false).indexOf(this.user_id);
            contains_group = items_before.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
            contains_group_new = items.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
            let ops = [];
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
                            status: "offline",
                            client_status: {web: session?.status}, // TODO:
                            activities: [],
                        },
                        premium_since: member.premium_since,
                        pending: false,
                        nick: null,
                        mute: false,
                        joined_at: member.joined_at,
                        hoisted_role: null,
                        deaf: false,
                        communication_disabled_until: null,
                        avatar: null
                    }

                }
            });
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
