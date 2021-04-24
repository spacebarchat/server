export const UserUpdateSchema = {
	id: String,
    username: String,
    discriminator: String,
    avatar: String || null,
    $phone: String,
    desktop: Boolean,
    mobile: Boolean,
    premium: Boolean,
    premium_type: Number,
    bot: Boolean,
    system: Boolean,
    nsfw_allowed: Boolean,
    mfa_enabled: Boolean,
    created_at: Date,
    verified: Boolean,
    $email: String,
    flags: BigInt,
    public_flags: BigInt,
    $guilds: [String],
};

export interface UserUpdateSchema {
	id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    phone?: string;
    desktop: boolean;
    mobile: boolean;
    premium: boolean;
    premium_type: number;
    bot: boolean;
    system: boolean;
    nsfw_allowed: boolean;
    mfa_enabled: boolean;
    created_at: Date;
    verified: boolean;
    email?: string;
    flags: bigint;
    public_flags: bigint;
    guilds: string[];
}
