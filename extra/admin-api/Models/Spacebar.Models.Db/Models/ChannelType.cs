namespace Spacebar.Models.Db.Models;

public enum ChannelType {
    GuildText = 0,
    Dm = 1,
    GuildVoice = 2,
    GroupDm = 3,
    GuildCategory = 4,
    GuildNews = 5,
    GuildStore = 6,
    GuildLfg = 7,
    LfgGroupDm = 8,
    ThreadAlpha = 9,
    GuildNewsThread = 10,
    GuildPublicThread = 11,
    GuildPrivateThread = 12,
    GuildStageVoice = 13,
    GuildDirectory = 14,
    GuildForum = 15,
    GuildMedia = 16,
    Lobby = 17,
    EphemeralDm = 18,
    Unhandled = 255,
}
