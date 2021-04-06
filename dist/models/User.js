"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.UserSchema = void 0;
const Activity_1 = require("./Activity");
const Status_1 = require("./Status");
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.UserSchema = new mongoose_1.Schema({
    id: mongoose_1.Types.Long,
    username: String,
    discriminator: String,
    avatar: String,
    phone: String,
    desktop: Boolean,
    mobile: Boolean,
    premium: Boolean,
    date_of_birth: Date,
    premium_type: Number,
    bot: Boolean,
    system: Boolean,
    nsfw_allowed: Boolean,
    mfa_enabled: Boolean,
    created_at: Date,
    verified: Boolean,
    email: String,
    flags: mongoose_1.Types.Long,
    public_flags: mongoose_1.Types.Long,
    user_data: {
        fingerprints: [String],
        hash: String,
        guilds: [mongoose_1.Types.Long],
        valid_tokens_since: Date,
        relationships: [
            {
                id: mongoose_1.Types.Long,
                nickname: String,
                type: Number,
                user_id: mongoose_1.Types.Long,
            },
        ],
        connected_accounts: [
            {
                access_token: String,
                friend_sync: Boolean,
                id: String,
                name: String,
                revoked: Boolean,
                show_activity: Boolean,
                type: String,
                verifie: Boolean,
                visibility: Number,
            },
        ],
    },
    user_settings: {
        afk_timeout: Number,
        allow_accessibility_detection: Boolean,
        animate_emoji: Boolean,
        animate_stickers: Number,
        contact_sync_enabled: Boolean,
        convert_emoticons: Boolean,
        custom_status: {
            emoji_id: mongoose_1.Types.Long,
            emoji_name: String,
            expires_at: Number,
            text: String,
        },
        default_guilds_restricted: Boolean,
        detect_platform_accounts: Boolean,
        developer_mode: Boolean,
        disable_games_tab: Boolean,
        enable_tts_command: Boolean,
        explicit_content_filter: Number,
        friend_source_flags: { all: Boolean },
        gateway_connected: Boolean,
        gif_auto_play: Boolean,
        // every top guild is displayed as a "folder"
        guild_folders: [
            {
                color: Number,
                guild_ids: [mongoose_1.Types.Long],
                id: Number,
                name: String,
            },
        ],
        guild_positions: [mongoose_1.Types.Long],
        inline_attachment_media: Boolean,
        inline_embed_media: Boolean,
        locale: String,
        message_display_compact: Boolean,
        native_phone_integration_enabled: Boolean,
        render_embeds: Boolean,
        render_reactions: Boolean,
        restricted_guilds: [mongoose_1.Types.Long],
        show_current_game: Boolean,
        status: String,
        stream_notifications_enabled: Boolean,
        theme: String,
        timezone_offset: Number,
    },
    presence: {
        status: String,
        activities: [Activity_1.Activity],
        client_status: Status_1.ClientStatus,
    },
});
// @ts-ignore
exports.UserModel = Database_1.default.model("User", exports.UserSchema, "users");
//# sourceMappingURL=User.js.map