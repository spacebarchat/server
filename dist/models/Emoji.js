"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiModel = exports.EmojiSchema = void 0;
const mongoose_1 = require("mongoose");
exports.EmojiSchema = new mongoose_1.Schema({
    id: mongoose_1.Types.Long,
    animated: Boolean,
    available: Boolean,
    guild_id: mongoose_1.Types.Long,
    managed: Boolean,
    name: String,
    require_colons: Boolean,
    url: String,
    roles: [mongoose_1.Types.Long],
});
exports.EmojiModel = mongoose_1.model("Emoji", exports.EmojiSchema, "emojis");
//# sourceMappingURL=Emoji.js.map