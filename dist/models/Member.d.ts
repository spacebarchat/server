import { PublicUser } from "./User";
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
    settings: UserGuildSettings;
}
export interface PublicMember extends Omit<Member, "settings" | "id"> {
    user: PublicUser;
}
export interface UserGuildSettings {
    channel_overrides: {
        channel_id: bigint;
        message_notifications: number;
        mute_config: MuteConfig;
        muted: boolean;
    }[];
    message_notifications: number;
    mobile_push: boolean;
    mute_config: MuteConfig;
    muted: boolean;
    suppress_everyone: boolean;
    suppress_roles: boolean;
    version: number;
}
export interface MuteConfig {
    end_time: number;
    selected_time_window: number;
}
