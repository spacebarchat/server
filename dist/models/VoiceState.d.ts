/// <reference path="../util/MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
export interface VoiceState extends Document {
    guild_id?: bigint;
    channel_id: bigint;
    user_id: bigint;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    self_stream?: boolean;
    self_video: boolean;
    suppress: boolean;
}
export declare const VoiceSateSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const VoiceStateModel: import("mongoose").Model<VoiceState>;
