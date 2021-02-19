/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Ban extends Document {
    user_id: bigint;
    guild_id: bigint;
    ip: string;
    reason?: string;
}
export declare const BanSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const BanModel: import("mongoose").Model<Ban>;
