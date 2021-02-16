"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberModel = exports.MemberSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
const MuteConfig = {
    end_time: Number,
    selected_time_window: Number,
};
exports.MemberSchema = new mongoose_1.Schema({
    id: mongoose_1.Types.Long,
    guild_id: mongoose_1.Types.Long,
    nick: String,
    roles: [mongoose_1.Types.Long],
    joined_at: Number,
    premium_since: Number,
    deaf: Boolean,
    mute: Boolean,
    pending: Boolean,
    permissions: mongoose_1.Types.Long,
    settings: {
        channel_overrides: [
            {
                channel_id: mongoose_1.Types.Long,
                message_notifications: Number,
                mute_config: MuteConfig,
                muted: Boolean,
            },
        ],
        message_notifications: Number,
        mobile_push: Boolean,
        mute_config: MuteConfig,
        muted: Boolean,
        suppress_everyone: Boolean,
        suppress_roles: Boolean,
        version: Number,
    },
});
// @ts-ignore
exports.MemberModel = Database_1.default.model("Member", exports.MemberSchema, "members");
//# sourceMappingURL=Member.js.map