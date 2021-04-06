"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseCache = void 0;
require("./MongoBigInt");
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const events_1 = __importDefault(require("events"));
const uri = process.env.MONGO_URL || "mongodb://localhost:27017/fosscord?readPreference=secondaryPreferred";
console.log(`[DB] connect: ${uri}`);
const connection = mongoose_1.default.createConnection(uri, { autoIndex: true });
exports.default = connection;
class MongooseCache extends events_1.default {
    constructor(collection, pipeline, opts) {
        super();
        this.collection = collection;
        this.pipeline = pipeline;
        this.opts = opts;
        this.init = async () => {
            this.stream = this.collection.watch(this.pipeline, { fullDocument: "updateLookup" });
            this.stream.on("change", this.change);
            this.stream.on("close", this.destroy);
            this.stream.on("error", console.error);
            if (!this.opts.onlyEvents) {
                const arr = await this.collection.aggregate(this.pipeline).toArray();
                this.data = arr.length ? arr[0] : arr;
            }
        };
        this.convertResult = (obj) => {
            if (obj instanceof mongodb_1.Long)
                return BigInt(obj.toString());
            if (typeof obj === "object") {
                Object.keys(obj).forEach((key) => {
                    obj[key] = this.convertResult(obj[key]);
                });
            }
            return obj;
        };
        this.change = (doc) => {
            try {
                // @ts-ignore
                if (doc.fullDocument) {
                    // @ts-ignore
                    if (!this.opts.onlyEvents)
                        this.data = doc.fullDocument;
                }
                switch (doc.operationType) {
                    case "dropDatabase":
                        return this.destroy();
                    case "drop":
                        return this.destroy();
                    case "delete":
                        return this.emit("delete", doc.documentKey._id.toHexString());
                    case "insert":
                        return this.emit("insert", doc.fullDocument);
                    case "update":
                    case "replace":
                        return this.emit("change", doc.fullDocument);
                    case "invalidate":
                        return this.destroy();
                    default:
                        return;
                }
            }
            catch (error) {
                this.emit("error", error);
            }
        };
        this.destroy = () => {
            this.stream?.off("change", this.change);
            this.emit("close");
            if (this.stream.isClosed())
                return;
            return this.stream.close();
        };
    }
}
exports.MongooseCache = MongooseCache;
//# sourceMappingURL=Database.js.map