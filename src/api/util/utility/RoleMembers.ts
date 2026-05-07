export interface RoleMemberSnapshot {
    id: string;
    role_ids: string[];
}

export function normalizeRoleMemberPatchIds(value: unknown): string[] {
    if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) throw new TypeError("member_ids must be an array of strings");

    return [...new Set(value)];
}

export function getRoleMemberIdsToAdd(members: RoleMemberSnapshot[], requestedMemberIds: string[], roleId: string): string[] {
    const membersById = new Map(members.map((member) => [member.id, member]));

    return requestedMemberIds.filter((memberId) => {
        const member = membersById.get(memberId);

        return member && !member.role_ids.includes(roleId);
    });
}

export function getMissingRoleMemberIds(members: RoleMemberSnapshot[], requestedMemberIds: string[]): string[] {
    const foundMemberIds = new Set(members.map((member) => member.id));

    return requestedMemberIds.filter((memberId) => !foundMemberIds.has(memberId));
}
