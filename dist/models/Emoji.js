"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmojiModel = exports.EmojiSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.EmojiSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    animated: Boolean,
    available: Boolean,
    guild_id: String,
    managed: Boolean,
    name: String,
    require_colons: Boolean,
    url: String,
    roles: [String],
});
// @ts-ignore
exports.EmojiModel = Database_1.default.model("Emoji", exports.EmojiSchema, "emojis");
//# sourceMappingURL=Emoji.js.map