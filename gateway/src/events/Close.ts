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
    
    console.log("items_before");
    console.log(items_before);
    console.log("items_before-end");
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
            let sorted = await Sorting(member, guild_roles,guild_members);
            let items = [] as any[];
            let groups = [] as any[];
            items = sorted.items;
            groups = sorted.groups;
            
            console.log("items");
            console.log(items);
            console.log("items-end");
            let total_online = sorted.total_online;
		    let gml_index = items.map(object => object.member? object.member.id : false).indexOf(this.user_id);
		    const role = member.roles.first() || {id: member.guild_id};
			let index_online = items_before.map(object => object.member? object.member.id : false).indexOf(this.user_id);
            let contains_offline = items_before.map(object => object.group? object.group.id : false).indexOf("offline");
            let offline_position = items.map(object => object.group? object.group.id : false).indexOf("offline");
            let contains_group_new = items.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
            let group_old_pos = items_before.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
            if(offline_position == -1){
                offline_position = items.length-1;
            }
            let ops = [];
            ops.push({
                op: "DELETE",
                index: index_online//DELETE USER FROM GROUP
            }); 
            if(contains_group_new == -1){
                console.log("oldpos")
                console.log(group_old_pos);
                ops.push({
                    op: "DELETE", // DELETE group
                    index: group_old_pos,
                });
            }
            if(contains_offline == -1){
                console.log("offline_position")
                console.log(offline_position);
                ops.push({
                    op: "INSERT", // INSERT new group, if not existing
                    item: {
                        group: {
                            id: "offline",
                            count: 1
                        }
                    },
                    index: offline_position,
                });
            }
            ops.push({
                op: "INSERT", // INSERT USER INTO GROUP, PROBABLY ISSUE WITH INDEX NUM WOULD NEED TO FIGURE THIS OUT.
                item:{
                    member: {
                        user: {
                            username: member.user.username,
                            id: member.user.id,
                            discriminator: member.user.discriminator,
                            avatar: member.user.avatar,
                            },
                        roles: [role.id],
                        presence: {
                            user: {
                                id: member.user.id,
                            },
                            status: session?.status,
                            game: null,
                            client_status: {}, // TODO:
                            activities: [],
                        },
                        mute: false,
                        joined_at: member.joined_at,
                        hoisted_role: null,
                        deaf: false,

                    }
                },
                index: contains_offline == -1 && role.id === member.guild_id ? offline_position:gml_index,
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
