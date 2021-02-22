/// <reference path="../util/MongoBigInt.d.ts" />
import { PublicUser } from "./User";
import { Schema, Document } from "mongoose";
export interface Member {
    id: bigint;
    guild_id: bigint;
    nick?: string;
    roles: bigint[];
    joined_at: number;
    premium_since?: number;
    deaf: boolean;
    mute: boolean;
    pending: boolean;
    settings: UserGuildSettings;
}
export interface MemberDocument extends Member, Document {
    id: bigint;
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
export declare const MemberSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const MemberModel: import("mongoose").Model<MemberDocument>;
export interface PublicMember extends Omit<Member, "settings" | "id"> {
    user: PublicUser;
}
