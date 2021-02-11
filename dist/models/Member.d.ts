export interface Member {
    id: bigint;
    nick?: string;
    roles: bigint[];
    joined_at: number;
    premium_since?: number;
    deaf: boolean;
    mute: boolean;
    pending: boolean;
    permissions: bigint;
}
