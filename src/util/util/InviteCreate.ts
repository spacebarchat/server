import { IsNull } from "typeorm";

export const DEFAULT_INVITE_MAX_AGE = 86400;

export interface InviteCreateOptions {
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
    flags?: number;
    target_user_id?: string;
    target_user?: string;
    target_user_type?: number;
    target_type?: string | number;
}

export interface NormalizedInviteCreateOptions {
    max_age: number;
    max_uses: number;
    temporary: boolean;
    unique: boolean;
    flags: number;
    target_user_id?: string;
    target_user_type?: number;
    created_at: Date;
    expires_at?: Date;
}

export interface InviteCreateContext {
    guild_id: string;
    channel_id: string;
    inviter_id?: string;
}

export interface ReusableInviteCandidate {
    isExpired(now?: Date): boolean;
}

function normalizeInviteDuration(value: number | undefined, fallback: number) {
    return Math.max(0, value ?? fallback);
}

function normalizeInviteTargetType(options: InviteCreateOptions) {
    if (options.target_user_type !== undefined) return options.target_user_type;
    if (options.target_type === undefined) return undefined;

    const targetType = typeof options.target_type === "number" ? options.target_type : Number.parseInt(options.target_type, 10);
    return Number.isNaN(targetType) ? undefined : targetType;
}

export function normalizeInviteCreateOptions(options: InviteCreateOptions, now = new Date()): NormalizedInviteCreateOptions {
    const max_age = normalizeInviteDuration(options.max_age, DEFAULT_INVITE_MAX_AGE);
    const max_uses = normalizeInviteDuration(options.max_uses, 0);

    return {
        max_age,
        max_uses,
        temporary: options.temporary ?? false,
        unique: options.unique ?? false,
        flags: options.flags ?? 0,
        target_user_id: options.target_user_id ?? options.target_user,
        target_user_type: normalizeInviteTargetType(options),
        created_at: now,
        expires_at: max_age === 0 ? undefined : new Date(now.getTime() + max_age * 1000),
    };
}

export function buildInviteReuseCriteria(context: InviteCreateContext, options: NormalizedInviteCreateOptions) {
    return {
        guild_id: context.guild_id,
        channel_id: context.channel_id,
        inviter_id: context.inviter_id ?? IsNull(),
        max_age: options.max_age,
        max_uses: options.max_uses,
        temporary: options.temporary,
        flags: options.flags,
        target_user_id: options.target_user_id ?? IsNull(),
        target_user_type: options.target_user_type ?? IsNull(),
    };
}

export function findReusableInviteCandidate<T extends ReusableInviteCandidate>(invites: T[], now = new Date()) {
    return invites.find((invite) => !invite.isExpired(now));
}

export function shouldReuseInviteForCreate(options: NormalizedInviteCreateOptions) {
    return !options.unique;
}
