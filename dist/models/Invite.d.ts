/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Invite extends Document {
    code: string;
    temporary: boolean;
    uses: number;
    max_uses: number;
    max_age: number;
    created_at: number;
    guild_id: bigint;
    channel_id: bigint;
    inviter_id: bigint;
    target_user_id?: bigint;
    target_user_type?: number;
}
export declare const InviteSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const InviteModel: import("mongoose").Model<Invite>;
