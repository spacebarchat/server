"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifySchema = void 0;
const Activity_1 = require("./Activity");
exports.IdentifySchema = {
    token: String,
    intents: BigInt,
    $properties: {
        // bruh discord really uses $ in the property key, so we need to double prefix it, because instanceOf treats $ (prefix) as a optional key
        $$os: String,
        $$browser: String,
        $$device: String,
    },
    $presence: Activity_1.ActivitySchema,
    $compress: Boolean,
    $large_threshold: Number,
    $shard: [Number],
    $guild_subscriptions: Boolean,
};
//# sourceMappingURL=Identify.js.map