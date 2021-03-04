"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModel = exports.GuildSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.GuildSchema = new mongoose_1.Schema({
    id: { type: mongoose_1.Types.Long, required: true },
    afk_channel_id: mongoose_1.Types.Long,
    afk_timeout: Number,
    application_id: mongoose_1.Types.Long,
    banner: String,
    default_message_notifications: Number,
    description: String,
    discovery_splash: String,
    explicit_content_filter: Number,
    features: { type: [String], default: [] },
    icon: String,
    large: Boolean,
    max_members: { type: Number, default: 100000 },
    max_presences: Number,
    max_video_channel_users: { type: Number, default: 25 },
    member_count: Number,
    presence_count: Number,
    mfa_level: Number,
    name: { type: String, required: true },
    owner_id: { type: mongoose_1.Types.Long, required: true },
    preferred_locale: String,
    premium_subscription_count: Number,
    premium_tier: Number,
    public_updates_channel_id: mongoose_1.Types.Long,
    region: String,
    rules_channel_id: mongoose_1.Types.Long,
    splash: String,
    system_channel_flags: Number,
    system_channel_id: mongoose_1.Types.Long,
    unavailable: Boolean,
    vanity_url_code: String,
    verification_level: Number,
    voice_states: { type: [Object], default: [] },
    welcome_screen: { type: [Object], default: [] },
    widget_channel_id: mongoose_1.Types.Long,
    widget_enabled: Boolean,
});
// GuildSchema.virtual
// @ts-ignore
exports.GuildModel = Database_1.default.model("Guild", exports.GuildSchema, "guilds");
//# sourceMappingURL=Guild.js.map