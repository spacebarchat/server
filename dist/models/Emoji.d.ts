/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface Emoji extends Document {
    id: bigint;
    animated: boolean;
    available: boolean;
    guild_id: bigint;
    managed: boolean;
    name: string;
    require_colons: boolean;
    url: string;
    roles: bigint[];
}
export declare const EmojiSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const EmojiModel: import("mongoose").Model<Emoji>;
