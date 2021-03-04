"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogEvents = exports.AuditLogModel = exports.AuditLogSchema = exports.AuditLogChanges = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.AuditLogChanges = {
    name: String,
    description: String,
    icon_hash: String,
    splash_hash: String,
    discovery_splash_hash: String,
    banner_hash: String,
    owner_id: mongoose_1.Types.Long,
    region: String,
    preferred_locale: String,
    afk_channel_id: mongoose_1.Types.Long,
    afk_timeout: Number,
    rules_channel_id: mongoose_1.Types.Long,
    public_updates_channel_id: mongoose_1.Types.Long,
    mfa_level: Number,
    verification_level: Number,
    explicit_content_filter: Number,
    default_message_notifications: Number,
    vanity_url_code: String,
    $add: [{}],
    $remove: [{}],
    prune_delete_days: Number,
    widget_enabled: Boolean,
    widget_channel_id: mongoose_1.Types.Long,
    system_channel_id: mongoose_1.Types.Long,
    position: Number,
    topic: String,
    bitrate: Number,
    permission_overwrites: [{}],
    nsfw: Boolean,
    application_id: mongoose_1.Types.Long,
    rate_limit_per_user: Number,
    permissions: String,
    color: Number,
    hoist: Boolean,
    mentionable: Boolean,
    allow: String,
    deny: String,
    code: String,
    channel_id: mongoose_1.Types.Long,
    inviter_id: mongoose_1.Types.Long,
    max_uses: Number,
    uses: Number,
    max_age: Number,
    temporary: Boolean,
    deaf: Boolean,
    mute: Boolean,
    nick: String,
    avatar_hash: String,
    id: mongoose_1.Types.Long,
    type: Number,
    enable_emoticons: Boolean,
    expire_behavior: Number,
    expire_grace_period: Number,
    user_limit: Number,
};
exports.AuditLogSchema = new mongoose_1.Schema({
    target_id: mongoose_1.Types.Long,
    user_id: { type: mongoose_1.Types.Long, required: true },
    id: { type: mongoose_1.Types.Long, required: true },
    action_type: { type: Number, required: true },
    options: {
        delete_member_days: String,
        members_removed: String,
        channel_id: mongoose_1.Types.Long,
        messaged_id: mongoose_1.Types.Long,
        count: String,
        id: mongoose_1.Types.Long,
        type: String,
        role_name: String,
    },
    changes: [
        {
            new_value: exports.AuditLogChanges,
            old_value: exports.AuditLogChanges,
            key: String,
        },
    ],
    reason: String,
});
// @ts-ignore
exports.AuditLogModel = Database_1.default.model("AuditLog", exports.AuditLogSchema, "auditlogs");
var AuditLogEvents;
(function (AuditLogEvents) {
    AuditLogEvents[AuditLogEvents["GUILD_UPDATE"] = 1] = "GUILD_UPDATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_CREATE"] = 10] = "CHANNEL_CREATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_UPDATE"] = 11] = "CHANNEL_UPDATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_DELETE"] = 12] = "CHANNEL_DELETE";
    AuditLogEvents[AuditLogEvents["CHANNEL_OVERWRITE_CREATE"] = 13] = "CHANNEL_OVERWRITE_CREATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_OVERWRITE_UPDATE"] = 14] = "CHANNEL_OVERWRITE_UPDATE";
    AuditLogEvents[AuditLogEvents["CHANNEL_OVERWRITE_DELETE"] = 15] = "CHANNEL_OVERWRITE_DELETE";
    AuditLogEvents[AuditLogEvents["MEMBER_KICK"] = 20] = "MEMBER_KICK";
    AuditLogEvents[AuditLogEvents["MEMBER_PRUNE"] = 21] = "MEMBER_PRUNE";
    AuditLogEvents[AuditLogEvents["MEMBER_BAN_ADD"] = 22] = "MEMBER_BAN_ADD";
    AuditLogEvents[AuditLogEvents["MEMBER_BAN_REMOVE"] = 23] = "MEMBER_BAN_REMOVE";
    AuditLogEvents[AuditLogEvents["MEMBER_UPDATE"] = 24] = "MEMBER_UPDATE";
    AuditLogEvents[AuditLogEvents["MEMBER_ROLE_UPDATE"] = 25] = "MEMBER_ROLE_UPDATE";
    AuditLogEvents[AuditLogEvents["MEMBER_MOVE"] = 26] = "MEMBER_MOVE";
    AuditLogEvents[AuditLogEvents["MEMBER_DISCONNECT"] = 27] = "MEMBER_DISCONNECT";
    AuditLogEvents[AuditLogEvents["BOT_ADD"] = 28] = "BOT_ADD";
    AuditLogEvents[AuditLogEvents["ROLE_CREATE"] = 30] = "ROLE_CREATE";
    AuditLogEvents[AuditLogEvents["ROLE_UPDATE"] = 31] = "ROLE_UPDATE";
    AuditLogEvents[AuditLogEvents["ROLE_DELETE"] = 32] = "ROLE_DELETE";
    AuditLogEvents[AuditLogEvents["INVITE_CREATE"] = 40] = "INVITE_CREATE";
    AuditLogEvents[AuditLogEvents["INVITE_UPDATE"] = 41] = "INVITE_UPDATE";
    AuditLogEvents[AuditLogEvents["INVITE_DELETE"] = 42] = "INVITE_DELETE";
    AuditLogEvents[AuditLogEvents["WEBHOOK_CREATE"] = 50] = "WEBHOOK_CREATE";
    AuditLogEvents[AuditLogEvents["WEBHOOK_UPDATE"] = 51] = "WEBHOOK_UPDATE";
    AuditLogEvents[AuditLogEvents["WEBHOOK_DELETE"] = 52] = "WEBHOOK_DELETE";
    AuditLogEvents[AuditLogEvents["EMOJI_CREATE"] = 60] = "EMOJI_CREATE";
    AuditLogEvents[AuditLogEvents["EMOJI_UPDATE"] = 61] = "EMOJI_UPDATE";
    AuditLogEvents[AuditLogEvents["EMOJI_DELETE"] = 62] = "EMOJI_DELETE";
    AuditLogEvents[AuditLogEvents["MESSAGE_DELETE"] = 72] = "MESSAGE_DELETE";
    AuditLogEvents[AuditLogEvents["MESSAGE_BULK_DELETE"] = 73] = "MESSAGE_BULK_DELETE";
    AuditLogEvents[AuditLogEvents["MESSAGE_PIN"] = 74] = "MESSAGE_PIN";
    AuditLogEvents[AuditLogEvents["MESSAGE_UNPIN"] = 75] = "MESSAGE_UNPIN";
    AuditLogEvents[AuditLogEvents["INTEGRATION_CREATE"] = 80] = "INTEGRATION_CREATE";
    AuditLogEvents[AuditLogEvents["INTEGRATION_UPDATE"] = 81] = "INTEGRATION_UPDATE";
    AuditLogEvents[AuditLogEvents["INTEGRATION_DELETE"] = 82] = "INTEGRATION_DELETE";
})(AuditLogEvents = exports.AuditLogEvents || (exports.AuditLogEvents = {}));
//# sourceMappingURL=AuditLog.js.map