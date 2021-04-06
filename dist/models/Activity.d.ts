import { User } from "..";
import { ClientStatus, Status } from "./Status";
import { Types } from "mongoose";
export interface Presence {
    user: User;
    guild_id?: bigint;
    status: Status;
    activities: Activity[];
    client_status: ClientStatus;
}
export interface Activity {
    name: string;
    type: ActivityType;
    url?: string;
    created_at?: Date;
    timestamps?: {
        start?: number;
        end?: number;
    }[];
    application_id?: bigint;
    details?: string;
    state?: string;
    emoji?: {
        name: string;
        id?: bigint;
        amimated?: boolean;
    };
    party?: {
        id?: string;
        size?: [number, number];
    };
    assets?: {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    };
    secrets?: {
        join?: string;
        spectate?: string;
        match?: string;
    };
    instance?: boolean;
    flags?: bigint;
}
export declare const Activity: {
    name: StringConstructor;
    type: NumberConstructor;
    $url: StringConstructor;
    $created_at: DateConstructor;
    $timestamps: {
        $start: NumberConstructor;
        $end: NumberConstructor;
    }[];
    $application_id: typeof Types.Long;
    $details: StringConstructor;
    $state: StringConstructor;
    $emoji: {
        $name: StringConstructor;
        $id: typeof Types.Long;
        $amimated: BooleanConstructor;
    };
    $party: {
        $id: StringConstructor;
        $size: NumberConstructor[];
    };
    $assets: {
        $large_image: StringConstructor;
        $large_text: StringConstructor;
        $small_image: StringConstructor;
        $small_text: StringConstructor;
    };
    $secrets: {
        $join: StringConstructor;
        $spectate: StringConstructor;
        $match: StringConstructor;
    };
    $instance: BooleanConstructor;
    $flags: typeof Types.Long;
};
export declare enum ActivityType {
    GAME = 0,
    STREAMING = 1,
    LISTENING = 2,
    CUSTOM = 4,
    COMPETING = 5
}
