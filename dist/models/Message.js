"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = exports.MessageSchema = exports.Embed = exports.EmbedImage = exports.Attachment = exports.MessageType = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
const User_1 = require("./User");
const Member_1 = require("./Member");
const Role_1 = require("./Role");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["DEFAULT"] = 0] = "DEFAULT";
    MessageType[MessageType["RECIPIENT_ADD"] = 1] = "RECIPIENT_ADD";
    MessageType[MessageType["RECIPIENT_REMOVE"] = 2] = "RECIPIENT_REMOVE";
    MessageType[MessageType["CALL"] = 3] = "CALL";
    MessageType[MessageType["CHANNEL_NAME_CHANGE"] = 4] = "CHANNEL_NAME_CHANGE";
    MessageType[MessageType["CHANNEL_ICON_CHANGE"] = 5] = "CHANNEL_ICON_CHANGE";
    MessageType[MessageType["CHANNEL_PINNED_MESSAGE"] = 6] = "CHANNEL_PINNED_MESSAGE";
    MessageType[MessageType["GUILD_MEMBER_JOIN"] = 7] = "GUILD_MEMBER_JOIN";
    MessageType[MessageType["USER_PREMIUM_GUILD_SUBSCRIPTION"] = 8] = "USER_PREMIUM_GUILD_SUBSCRIPTION";
    MessageType[MessageType["USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1"] = 9] = "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1";
    MessageType[MessageType["USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2"] = 10] = "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2";
    MessageType[MessageType["USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3"] = 11] = "USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3";
    MessageType[MessageType["CHANNEL_FOLLOW_ADD"] = 12] = "CHANNEL_FOLLOW_ADD";
    MessageType[MessageType["GUILD_DISCOVERY_DISQUALIFIED"] = 14] = "GUILD_DISCOVERY_DISQUALIFIED";
    MessageType[MessageType["GUILD_DISCOVERY_REQUALIFIED"] = 15] = "GUILD_DISCOVERY_REQUALIFIED";
    MessageType[MessageType["REPLY"] = 19] = "REPLY";
    MessageType[MessageType["APPLICATION_COMMAND"] = 20] = "APPLICATION_COMMAND";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
exports.Attachment = {
    id: String,
    filename: String,
    size: Number,
    url: String,
    proxy_url: String,
    height: Number,
    width: Number,
};
exports.EmbedImage = {
    url: String,
    proxy_url: String,
    height: Number,
    width: Number,
};
const Reaction = {
    count: Number,
    emoji: {
        id: String,
        name: String,
        animated: Boolean,
    },
};
exports.Embed = {
    title: String,
    type: String,
    description: String,
    url: String,
    timestamp: Date,
    color: Number,
    footer: {
        text: String,
        icon_url: String,
        proxy_icon_url: String,
    },
    image: exports.EmbedImage,
    thumbnail: exports.EmbedImage,
    video: exports.EmbedImage,
    provider: {
        name: String,
        url: String,
    },
    author: {
        name: String,
        url: String,
        icon_url: String,
        proxy_icon_url: String,
    },
    fields: [
        {
            name: String,
            value: String,
            inline: Boolean,
        },
    ],
};
exports.MessageSchema = new mongoose_1.Schema({
    id: String,
    channel_id: String,
    author_id: String,
    webhook_id: String,
    guild_id: String,
    application_id: String,
    content: String,
    timestamp: Date,
    edited_timestamp: Date,
    tts: Boolean,
    mention_everyone: Boolean,
    mention_user_ids: [String],
    mention_role_ids: [String],
    mention_channel_ids: [String],
    attachments: [exports.Attachment],
    embeds: [exports.Embed],
    reactions: [Reaction],
    nonce: mongoose_1.Schema.Types.Mixed,
    pinned: Boolean,
    type: { type: Number },
    activity: {
        type: Number,
        party_id: String,
    },
    flags: mongoose_1.Types.Long,
    stickers: [],
    message_reference: {
        message_id: String,
        channel_id: String,
        guild_id: String,
    },
});
exports.MessageSchema.virtual("author", {
    ref: User_1.UserModel,
    localField: "author_id",
    foreignField: "id",
    justOne: true,
});
exports.MessageSchema.virtual("member", {
    ref: Member_1.MemberModel,
    localField: "author_id",
    foreignField: "id",
    justOne: true,
});
exports.MessageSchema.virtual("mentions", {
    ref: User_1.UserModel,
    localField: "mention_user_ids",
    foreignField: "id",
    justOne: true,
});
exports.MessageSchema.virtual("mention_roles", {
    ref: Role_1.RoleModel,
    localField: "mention_role_ids",
    foreignField: "id",
    justOne: true,
});
exports.MessageSchema.virtual("mention_channels", {
    ref: Role_1.RoleModel,
    localField: "mention_role_ids",
    foreignField: "id",
    justOne: true,
});
// TODO: missing Application Model
// MessageSchema.virtual("application", {
// 	ref: Application,
// 	localField: "mention_role_ids",
// 	foreignField: "id",
// 	justOne: true,
// });
// @ts-ignore
exports.MessageModel = Database_1.default.model("Message", exports.MessageSchema, "messages");
//# sourceMappingURL=Message.js.map