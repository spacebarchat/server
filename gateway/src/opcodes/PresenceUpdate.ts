import { WebSocket, Payload } from "@fosscord/gateway";
import { emitEvent, PresenceUpdateEvent, Session, User, Member, Role } from "@fosscord/util";
import { ActivitySchema } from "../schema/Activity";
import { check } from "./instanceOf";

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
    const role = member.roles.first() || {id: "online"};
    
    const guild_roles = await Role.find({
		where: { guild_id },
        select: ["id"],
        order: {position: "DESC"},
	});
    const guild_members = await Member.find({
        where: { guild_id },
        relations: ["roles"],
    });

    const groups = [] as any[];
    
	for (const gr of guild_roles) {
        var num = 0;
        for(const gm of guild_members) {
            const gmr = gm.roles.first() || {id: "online"};
            if(gmr.id === gr.id){
                num++;
            }
        }
        const group = {
            count: num,
            id: gr.id === guild_id ? "online" : gr.id,
        };
        groups.push(group);
    }
    
	
    
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
    
    
// 	await emitEvent ({
// 		event: "PRESENCE_UPDATE",
// 		user_id: this.user_id,
// 		data: {
// 			user: member.user,//await User.getPublicUser(this.user_id),
// 			activities: presence.activities,
// 			client_status: {web: presence.status}, // TODO:
// 			status: presence.status,
// 		},
// 	} as PresenceUpdateEvent);
    await emitEvent({
		event: "GUILD_MEMBER_LIST_UPDATE",
        guild_id,
		data: {
            online_count: member.guild.member_count,
            member_count: member.guild.member_count,
            guild_id,
            id: "everyone",
            groups: groups,
            ops: [{ 
                op: "UPDATE",
                item: {
                    member: {
                        user: member.user,
                        roles: [],
                        presence: {
                            user: {
                                id: member.user.id,
                            },
                            activities: presence.activities,
                            client_status: {web: presence.status}, // TODO:
                            status: presence.status,
                        },
                        joined_at: member.joined_at,
                        hoisted_role: null,
                        deaf: false,
                        mute: false,
                    },
                }
            }]
		},
	});
}
