"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = exports.MessageSchema = exports.MessageType = void 0;
const mongoose_1 = require("mongoose");
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
const Attachment = {
    id: mongoose_1.Types.Long,
    filename: String,
    size: Number,
    url: String,
    proxy_url: String,
    height: Number,
    width: Number,
};
const EmbedImage = {
    url: String,
    proxy_url: String,
    height: Number,
    width: Number,
};
const Reaction = {
    count: Number,
    emoji: {
        id: mongoose_1.Types.Long,
        name: String,
        animated: Boolean,
    },
};
const Embed = {
    title: String,
    type: String,
    description: String,
    url: String,
    timestamp: Number,
    color: Number,
    footer: {
        text: String,
        icon_url: String,
        proxy_icon_url: String,
    },
    image: EmbedImage,
    thumbnail: EmbedImage,
    video: EmbedImage,
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
    id: mongoose_1.Types.Long,
    channel_id: mongoose_1.Types.Long,
    author_id: mongoose_1.Types.Long,
    webhook_id: mongoose_1.Types.Long,
    application_id: mongoose_1.Types.Long,
    content: String,
    timestamp: Number,
    edited_timestamp: Number,
    tts: Boolean,
    mention_everyone: Boolean,
    mentions: [mongoose_1.Types.Long],
    mention_roles: [mongoose_1.Types.Long],
    mention_channels: [
        {
            id: mongoose_1.Types.Long,
            guild_id: mongoose_1.Types.Long,
            type: Number,
            name: String,
        },
    ],
    attachments: [Attachment],
    embeds: [Embed],
    reactions: [Reaction],
    nonce: mongoose_1.Schema.Types.Mixed,
    pinned: Boolean,
    type: MessageType,
    activity: {
        type: Number,
        party_id: String,
    },
    flags: mongoose_1.Types.Long,
    stickers: [],
    message_reference: {
        message_id: mongoose_1.Types.Long,
        channel_id: mongoose_1.Types.Long,
        guild_id: mongoose_1.Types.Long,
    },
});
exports.MessageModel = mongoose_1.model("Message", exports.MessageSchema, "messages");
//# sourceMappingURL=Message.js.map