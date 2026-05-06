type RoleMember = {
    id: string;
    roles: { id: string }[];
};

export type RoleMemberChanges = {
    addMemberIds: string[];
    removeMemberIds: string[];
};

export function calculateRoleMemberAdditions(members: RoleMember[], memberIds: string[], roleId: string): RoleMemberChanges {
    const desiredMemberIds = new Set(memberIds);
    const addMemberIds: string[] = [];

    for (const member of members) {
        const hasRole = member.roles.some((role) => role.id === roleId);
        const shouldHaveRole = desiredMemberIds.has(member.id);

        if (shouldHaveRole && !hasRole) addMemberIds.push(member.id);
    }

    return { addMemberIds, removeMemberIds: [] };
}

export function calculateRoleMemberReplacement(members: RoleMember[], memberIds: string[], roleId: string): RoleMemberChanges {
    const changes = calculateRoleMemberAdditions(members, memberIds, roleId);
    const desiredMemberIds = new Set(memberIds);

    for (const member of members) {
        const hasRole = member.roles.some((role) => role.id === roleId);
        const shouldHaveRole = desiredMemberIds.has(member.id);

        if (!shouldHaveRole && hasRole) changes.removeMemberIds.push(member.id);
    }

    return changes;
}
