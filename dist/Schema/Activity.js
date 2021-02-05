"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitySchema = void 0;
const Emoji_1 = require("./Emoji");
exports.ActivitySchema = {
    afk: Boolean,
    status: String,
    $activities: [
        {
            name: String,
            type: Number,
            $url: String,
            $created_at: Number,
            $timestamps: {
                // unix timestamps for start and/or end of the game
                start: Number,
                end: Number,
            },
            $application_id: BigInt,
            $details: String,
            $State: String,
            $emoji: Emoji_1.EmojiSchema,
            $party: {
                $id: String,
                $size: [Number],
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
            flags: BigInt,
        },
    ],
    $since: Number,
};
//# sourceMappingURL=Activity.js.map