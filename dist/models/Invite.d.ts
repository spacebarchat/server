/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Invite extends Document {
    code: string;
    temporary: boolean;
    uses: number;
    max_uses: number;
    max_age: number;
    created_at: Date;
    guild_id: string;
    channel_id: string;
    inviter_id: string;
    target_user_id?: string;
    target_user_type?: number;
}
export declare const InviteSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const InviteModel: import("mongoose").Model<Invite>;
