"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityType = exports.Activity = void 0;
const mongoose_1 = require("mongoose");
exports.Activity = {
    name: String,
    type: Number,
    $url: String,
    $created_at: Date,
    $timestamps: [
        {
            $start: Number,
            $end: Number,
        },
    ],
    $application_id: String,
    $details: String,
    $state: String,
    $emoji: {
        $name: String,
        $id: String,
        $amimated: Boolean,
    },
    $party: {
        $id: String,
        $size: [Number, Number],
    },
    $assets: {
        $large_image: String,
        $large_text: String,
        $small_image: String,
        $small_text: String,
    },
    $secrets: {
        $join: String,
        $spectate: String,
        $match: String,
    },
    $instance: Boolean,
    $flags: mongoose_1.Types.Long,
};
var ActivityType;
(function (ActivityType) {
    ActivityType[ActivityType["GAME"] = 0] = "GAME";
    ActivityType[ActivityType["STREAMING"] = 1] = "STREAMING";
    ActivityType[ActivityType["LISTENING"] = 2] = "LISTENING";
    ActivityType[ActivityType["CUSTOM"] = 4] = "CUSTOM";
    ActivityType[ActivityType["COMPETING"] = 5] = "COMPETING";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
//# sourceMappingURL=Activity.js.map