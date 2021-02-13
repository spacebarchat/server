/// <reference path="MongoBigInt.d.ts" />
import { Schema, Document } from "mongoose";
import "missing-native-js-functions";
declare const _default: {
    init: (defaultOpts?: any) => Promise<import("mongodb").UpdateWriteOpResult>;
    getAll: () => DefaultOptions;
    setAll: (val: any) => Promise<import("mongodb").UpdateWriteOpResult>;
};
export default _default;
export declare const DefaultOptions: {
    api: {};
    gateway: {};
    voice: {};
};
export interface DefaultOptions extends Document {
    api?: any;
    gateway?: any;
    voice?: any;
}
export declare const ConfigSchema: Schema<Document<any>, import("mongoose").Model<Document<any>>, undefined>;
export declare const ConfigModel: import("mongoose").Model<DefaultOptions>;
