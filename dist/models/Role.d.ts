/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Role {
    id: string;
    guild_id: string;
    color: number;
    hoist: boolean;
    managed: boolean;
    mentionable: boolean;
    name: string;
    permissions: bigint;
    position: number;
    tags?: {
        bot_id?: string;
    };
}
export interface RoleDocument extends Document, Role {
    id: string;
}
export declare const RoleSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const RoleModel: import("mongoose").Model<RoleDocument>;
