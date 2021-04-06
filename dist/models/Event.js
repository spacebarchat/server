"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTEnum = exports.EventModel = exports.EventSchema = void 0;
const mongoose_1 = require("mongoose");
const Database_1 = __importDefault(require("../util/Database"));
exports.EventSchema = new mongoose_1.Schema({
    guild_id: String,
    user_id: String,
    channel_id: String,
    created_at: { type: Date, required: true },
    event: { type: String, required: true },
    data: Object,
});
// @ts-ignore
exports.EventModel = Database_1.default.model("Event", exports.EventSchema, "events");
// located in collection events
var EVENTEnum;
(function (EVENTEnum) {
    EVENTEnum["Ready"] = "READY";
    EVENTEnum["ChannelCreate"] = "CHANNEL_CREATE";
    EVENTEnum["ChannelUpdate"] = "CHANNEL_UPDATE";
    EVENTEnum["ChannelDelete"] = "CHANNEL_DELETE";
    EVENTEnum["ChannelPinsUpdate"] = "CHANNEL_PINS_UPDATE";
    EVENTEnum["GuildCreate"] = "GUILD_CREATE";
    EVENTEnum["GuildUpdate"] = "GUILD_UPDATE";
    EVENTEnum["GuildDelete"] = "GUILD_DELETE";
    EVENTEnum["GuildBanAdd"] = "GUILD_BAN_ADD";
    EVENTEnum["GuildBanRemove"] = "GUILD_BAN_REMOVE";
    EVENTEnum["GuildEmojUpdate"] = "GUILD_EMOJI_UPDATE";
    EVENTEnum["GuildIntegrationsUpdate"] = "GUILD_INTEGRATIONS_UPDATE";
    EVENTEnum["GuildMemberAdd"] = "GUILD_MEMBER_ADD";
    EVENTEnum["GuildMemberRempve"] = "GUILD_MEMBER_REMOVE";
    EVENTEnum["GuildMemberUpdate"] = "GUILD_MEMBER_UPDATE";
    EVENTEnum["GuildMemberSpeaking"] = "GUILD_MEMBER_SPEAKING";
    EVENTEnum["GuildMembersChunk"] = "GUILD_MEMBERS_CHUNK";
    EVENTEnum["GuildRoleCreate"] = "GUILD_ROLE_CREATE";
    EVENTEnum["GuildRoleDelete"] = "GUILD_ROLE_DELETE";
    EVENTEnum["GuildRoleUpdate"] = "GUILD_ROLE_UPDATE";
    EVENTEnum["InviteCreate"] = "INVITE_CREATE";
    EVENTEnum["InviteDelete"] = "INVITE_DELETE";
    EVENTEnum["MessageCreate"] = "MESSAGE_CREATE";
    EVENTEnum["MessageUpdate"] = "MESSAGE_UPDATE";
    EVENTEnum["MessageDelete"] = "MESSAGE_DELETE";
    EVENTEnum["MessageDeleteBulk"] = "MESSAGE_DELETE_BULK";
    EVENTEnum["MessageReactionAdd"] = "MESSAGE_REACTION_ADD";
    EVENTEnum["MessageReactionRemove"] = "MESSAGE_REACTION_REMOVE";
    EVENTEnum["MessageReactionRemoveAll"] = "MESSAGE_REACTION_REMOVE_ALL";
    EVENTEnum["MessageReactionRemoveEmoji"] = "MESSAGE_REACTION_REMOVE_EMOJI";
    EVENTEnum["PresenceUpdate"] = "PRESENCE_UPDATE";
    EVENTEnum["TypingStart"] = "TYPING_START";
    EVENTEnum["UserUpdate"] = "USER_UPDATE";
    EVENTEnum["WebhooksUpdate"] = "WEBHOOKS_UPDATE";
    EVENTEnum["InteractionCreate"] = "INTERACTION_CREATE";
    EVENTEnum["VoiceStateUpdate"] = "VOICE_STATE_UPDATE";
    EVENTEnum["VoiceServerUpdate"] = "VOICE_SERVER_UPDATE";
    EVENTEnum["ApplicationCommandCreate"] = "APPLICATION_COMMAND_CREATE";
    EVENTEnum["ApplicationCommandUpdate"] = "APPLICATION_COMMAND_UPDATE";
    EVENTEnum["ApplicationCommandDelete"] = "APPLICATION_COMMAND_DELETE";
})(EVENTEnum = exports.EVENTEnum || (exports.EVENTEnum = {}));
//# sourceMappingURL=Event.js.map