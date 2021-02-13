/// <reference types="node" />
import "./MongoBigInt";
import mongoose, { Collection } from "mongoose";
import { ChangeStream, ChangeEvent } from "mongodb";
import EventEmitter from "events";
declare const _default: mongoose.Connection;
export default _default;
export interface MongooseCache {
    on(event: "delete", listener: (id: string) => void): this;
    on(event: "change", listener: (data: any) => void): this;
    on(event: "insert", listener: (data: any) => void): this;
    on(event: "close", listener: () => void): this;
}
export declare class MongooseCache extends EventEmitter {
    collection: Collection;
    pipeline: Array<Record<string, unknown>>;
    opts: {
        onlyEvents: boolean;
    };
    stream: ChangeStream;
    data: any;
    constructor(collection: Collection, pipeline: Array<Record<string, unknown>>, opts: {
        onlyEvents: boolean;
    });
    init(): Promise<void>;
    convertResult(obj: any): any;
    change: (doc: ChangeEvent) => boolean | Promise<any> | undefined;
    destroy(): Promise<any> | undefined;
}
