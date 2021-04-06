/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface GuildDocument extends Document, Guild {
    id: string;
}
export interface Guild {
    id: string;
    afk_channel_id?: string;
    afk_timeout?: number;
    application_id?: string;
    banner?: string;
    default_message_notifications?: number;
    description?: string;
    discovery_splash?: string;
    explicit_content_filter?: number;
    features: string[];
    icon?: string;
    large?: boolean;
    max_members?: number;
    max_presences?: number;
    max_video_channel_users?: number;
    member_count?: number;
    presence_count?: number;
    mfa_level?: number;
    name: string;
    owner_id: string;
    preferred_locale?: string;
    premium_subscription_count?: number;
    premium_tier?: number;
    public_updates_channel_id?: string;
    region?: string;
    rules_channel_id?: string;
    splash?: string;
    system_channel_flags?: number;
    system_channel_id?: string;
    unavailable?: boolean;
    vanity_url_code?: string;
    verification_level?: number;
    welcome_screen: [];
    widget_channel_id?: string;
    widget_enabled?: boolean;
}
export declare const GuildSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const GuildModel: import("mongoose").Model<GuildDocument>;
