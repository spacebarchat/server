"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildModel = exports.GuildSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
const Channel_1 = require("./Channel");
const Emoji_1 = require("./Emoji");
const Member_1 = require("./Member");
const Role_1 = require("./Role");
exports.GuildSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    afk_channel_id: String,
    afk_timeout: Number,
    application_id: String,
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
    owner_id: { type: String, required: true },
    preferred_locale: String,
    premium_subscription_count: Number,
    premium_tier: Number,
    public_updates_channel_id: String,
    region: String,
    rules_channel_id: String,
    splash: String,
    system_channel_flags: Number,
    system_channel_id: String,
    unavailable: Boolean,
    vanity_url_code: String,
    verification_level: Number,
    voice_states: { type: [Object], default: [] },
    welcome_screen: { type: [Object], default: [] },
    widget_channel_id: String,
    widget_enabled: Boolean,
});
exports.GuildSchema.virtual("channels", {
    ref: Channel_1.ChannelModel,
    localField: "id",
    foreignField: "guild_id",
    justOne: false,
});
exports.GuildSchema.virtual("roles", {
    ref: Role_1.RoleModel,
    localField: "id",
    foreignField: "guild_id",
    justOne: false,
});
// nested populate is needed for member users: https://gist.github.com/yangsu/5312204
exports.GuildSchema.virtual("members", {
    ref: Member_1.MemberModel,
    localField: "id",
    foreignField: "member_id",
    justOne: false,
});
exports.GuildSchema.virtual("emojis", {
    ref: Emoji_1.EmojiModel,
    localField: "id",
    foreignField: "guild_id",
    justOne: false,
});
exports.GuildSchema.virtual("joined_at", {
    ref: Member_1.MemberModel,
    localField: "id",
    foreignField: "guild_id",
    justOne: true,
}).get((member, virtual, doc) => {
    console.log("get", member, this);
    return member.joined_at;
});
// @ts-ignore
exports.GuildModel = Database_1.default.model("Guild", exports.GuildSchema, "guilds");
//# sourceMappingURL=Guild.js.map