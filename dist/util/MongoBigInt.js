"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class LongSchema extends mongoose_1.default.SchemaType {
    constructor() {
        super(...arguments);
        this.$conditionalHandlers = {
            $lt: this.handleSingle,
            $lte: this.handleSingle,
            $gt: this.handleSingle,
            $gte: this.handleSingle,
            $ne: this.handleSingle,
            $in: this.handleArray,
            $nin: this.handleArray,
            $mod: this.handleArray,
            $all: this.handleArray,
            $bitsAnySet: this.handleArray,
            $bitsAllSet: this.handleArray,
        };
    }
    handleSingle(val) {
        return this.cast(val, null, null, "handle");
    }
    handleArray(val) {
        var self = this;
        return val.map(function (m) {
            return self.cast(m, null, null, "handle");
        });
    }
    checkRequired(val) {
        return null != val;
    }
    cast(val, scope, init, type) {
        if (null === val)
            return val;
        if ("" === val)
            return null;
        if (typeof val === "bigint" && type === "query") {
            return mongoose_1.default.mongo.Long.fromString(val.toString());
        }
        if (val instanceof mongoose_1.default.mongo.Long) {
            if (type === "handle" || init == false)
                return val;
            return BigInt(val.toString());
        }
        if (val instanceof Number || "number" == typeof val)
            return BigInt(val);
        if (!Array.isArray(val) && val.toString)
            return BigInt(val.toString());
        // @ts-ignore
        throw new SchemaType.CastError("Long", val);
    }
    castForQuery($conditional, value) {
        var handler;
        if (2 === arguments.length) {
            // @ts-ignore
            handler = this.$conditionalHandlers[$conditional];
            if (!handler) {
                throw new Error("Can't use " + $conditional + " with Long.");
            }
            return handler.call(this, value);
        }
        else {
            return this.cast($conditional, null, null, "query");
        }
    }
}
LongSchema.cast = mongoose_1.default.SchemaType.cast;
LongSchema.set = mongoose_1.default.SchemaType.set;
LongSchema.get = mongoose_1.default.SchemaType.get;
mongoose_1.default.Schema.Types.Long = LongSchema;
mongoose_1.default.Types.Long = mongoose_1.default.mongo.Long;
//# sourceMappingURL=MongoBigInt.js.map