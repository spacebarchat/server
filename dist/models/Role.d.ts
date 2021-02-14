/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Role {
    id: bigint;
    guild_id: bigint;
    color: number;
    hoist: boolean;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: bigint;
    position: number;
    tags?: {
        bot_id?: bigint;
    };
}
export interface RoleDocument extends Document, Role {
    id: bigint;
}
export declare const RoleSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const RoleModel: import("mongoose").Model<RoleDocument>;
