export function resolveCreatedRolePermissions(options: { requested?: string; everyone?: string; actor?: bigint }) {
    const fallback = options.everyone ?? "0";
    const requested = options.requested && options.requested !== "0" ? options.requested : fallback;
    const actorPermissions = options.actor ?? 0n;

    return String(actorPermissions & BigInt(requested));
}
