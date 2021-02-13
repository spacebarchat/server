"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceStateModel = exports.VoiceSateSchema = void 0;
const mongoose_1 = require("mongoose");
exports.VoiceSateSchema = new mongoose_1.Schema({
    guild_id: mongoose_1.Types.Long,
    channel_id: mongoose_1.Types.Long,
    user_id: mongoose_1.Types.Long,
    session_id: String,
    deaf: Boolean,
    mute: Boolean,
    self_deaf: Boolean,
    self_mute: Boolean,
    self_stream: Boolean,
    self_video: Boolean,
    suppress: Boolean,
});
exports.VoiceStateModel = mongoose_1.model("VoiceState", exports.VoiceSateSchema, "voicestates");
//# sourceMappingURL=VoiceState.js.map