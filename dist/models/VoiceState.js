"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceStateModel = exports.VoiceSateSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.VoiceSateSchema = new mongoose_1.Schema({
    guild_id: String,
    channel_id: String,
    user_id: String,
    session_id: String,
    deaf: Boolean,
    mute: Boolean,
    self_deaf: Boolean,
    self_mute: Boolean,
    self_stream: Boolean,
    self_video: Boolean,
    suppress: Boolean,
});
// @ts-ignore
exports.VoiceStateModel = Database_1.default.model("VoiceState", exports.VoiceSateSchema, "voicestates");
//# sourceMappingURL=VoiceState.js.map