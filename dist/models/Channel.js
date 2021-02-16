"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelType = exports.ChannelPermissionOverwriteType = exports.ChannelModel = exports.ChannelSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.ChannelSchema = new mongoose_1.Schema({
    id: mongoose_1.Types.Long,
    created_at: { type: mongoose_1.Schema.Types.Date, required: true },
    name: { type: String, required: true },
    type: { type: Number, required: true },
    guild_id: mongoose_1.Types.Long,
    owner_id: mongoose_1.Types.Long,
    parent_id: mongoose_1.Types.Long,
    recipients: [mongoose_1.Types.Long],
    position: Number,
    last_message_id: mongoose_1.Types.Long,
    last_pin_timestamp: Date,
    nsfw: Boolean,
    rate_limit_per_user: Number,
    topic: String,
    permission_overwrites: [
        {
            allow: mongoose_1.Types.Long,
            deny: mongoose_1.Types.Long,
            id: mongoose_1.Types.Long,
            type: Number,
        },
    ],
});
// @ts-ignore
exports.ChannelModel = Database_1.default.model("Channel", exports.ChannelSchema, "channels");
var ChannelPermissionOverwriteType;
(function (ChannelPermissionOverwriteType) {
    ChannelPermissionOverwriteType[ChannelPermissionOverwriteType["role"] = 0] = "role";
    ChannelPermissionOverwriteType[ChannelPermissionOverwriteType["member"] = 1] = "member";
})(ChannelPermissionOverwriteType = exports.ChannelPermissionOverwriteType || (exports.ChannelPermissionOverwriteType = {}));
var ChannelType;
(function (ChannelType) {
    ChannelType[ChannelType["GUILD_TEXT"] = 0] = "GUILD_TEXT";
    ChannelType[ChannelType["DM"] = 1] = "DM";
    ChannelType[ChannelType["GUILD_VOICE"] = 2] = "GUILD_VOICE";
    ChannelType[ChannelType["GROUP_DM"] = 3] = "GROUP_DM";
    ChannelType[ChannelType["GUILD_CATEGORY"] = 4] = "GUILD_CATEGORY";
    ChannelType[ChannelType["GUILD_NEWS"] = 5] = "GUILD_NEWS";
    ChannelType[ChannelType["GUILD_STORE"] = 6] = "GUILD_STORE";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
//# sourceMappingURL=Channel.js.map