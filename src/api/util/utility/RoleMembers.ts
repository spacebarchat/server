type RoleMember = {
    id: string;
    roles: { id: string }[];
};

export type RoleMemberReplacement = {
    addMemberIds: string[];
    removeMemberIds: string[];
};

export function calculateRoleMemberReplacement(members: RoleMember[], memberIds: string[], roleId: string): RoleMemberReplacement {
    const desiredMemberIds = new Set(memberIds);
    const addMemberIds: string[] = [];
    const removeMemberIds: string[] = [];

    for (const member of members) {
        const hasRole = member.roles.some((role) => role.id === roleId);
        const shouldHaveRole = desiredMemberIds.has(member.id);

        if (shouldHaveRole && !hasRole) addMemberIds.push(member.id);
        if (!shouldHaveRole && hasRole) removeMemberIds.push(member.id);
    }

    return { addMemberIds, removeMemberIds };
}
