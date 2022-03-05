import {
  Member,
  User,
  Session,
    Role,
} from "@fosscord/util";

export async function Sorting(member: Member, guild_roles: Role[], guild_members: Member[]) {
  let items = [] as any[];
  const groups = [] as any[];
  // @ts-ignore
  let [members_online, members_offline] = partition(guild_members, (m: Member) => 
    m.user.sessions.length > 0
  );
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
      item_loop(role_members, member).map((x: any) => items.push(x))
    }
    members_online = other_members;
  }
  const group = {
    count: members_offline.length,
    id: "offline"
  }
  items.push({group});
  groups.push(group);
  item_loop(members_offline, member).map((x: any) => items.push(x))
  return {
    items: items,
    groups: groups,
    total_online: total_online
  }
}
function item_loop(members: Member[], member: Member){
    let items = [];
    for (const m of members) {
      const roles = m.roles
                  .filter((x: Role) => x.id !== member.guild_id)
                  .map((x: Role) => x.id);
      const session = m.user.sessions.first();
      // TODO: properly mock/hide offline/invisible status
      items.push({
        member: {
          ...m,
          roles,
          user: { ...m.user, sessions: undefined },
          presence: {
              ...session,
              activities: session?.activities || [],
              user: { id: m.user.id },
          },
        },
      });
    }
    return items;
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