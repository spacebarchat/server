/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Invite extends Document {
    code: string;
    temporary: boolean;
    uses: number;
    max_uses: number;
    max_age: number;
    created_at: number;
    guild: {
        id: bigint;
        name: string;
        splash: string;
        description: string;
        icon: string;
        features: Object;
        verification_level: number;
    };
    channel: {
        id: bigint;
        name: string;
        type: number;
    };
    inviter: {
        id: bigint;
        username: string;
        avatar: string;
        discriminator: number;
    };
    target_user: {
        id: bigint;
        username: string;
        avatar: string;
        discriminator: number;
    };
    target_user_type: number;
}
export declare const InviteSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const InviteModel: import("mongoose").Model<Invite>;
