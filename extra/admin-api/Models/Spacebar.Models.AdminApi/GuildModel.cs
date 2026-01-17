namespace Spacebar.Models.AdminApi;

public class GuildModel {
    public string Id { get; set; } = null!;
    public string? AfkChannelId { get; set; }
    public int? AfkTimeout { get; set; }
    public string? Banner { get; set; }
    public int? DefaultMessageNotifications { get; set; }
    public string? Description { get; set; }
    public string? DiscoverySplash { get; set; }
    public int? ExplicitContentFilter { get; set; }
    public string Features { get; set; } = null!;
    public string? PrimaryCategoryId { get; set; }
    public string? Icon { get; set; }
    public bool Large { get; set; }
    public int? MaxMembers { get; set; }
    public int? MaxPresences { get; set; }
    public int? MaxVideoChannelUsers { get; set; }
    public int? MemberCount { get; set; }
    public int? PresenceCount { get; set; }
    public string? TemplateId { get; set; }
    public int? MfaLevel { get; set; }
    public string Name { get; set; } = null!;
    public string? OwnerId { get; set; }
    public string? PreferredLocale { get; set; }
    public int? PremiumSubscriptionCount { get; set; }
    public int PremiumTier { get; set; }
    public string? PublicUpdatesChannelId { get; set; }
    public string? RulesChannelId { get; set; }
    public string? Region { get; set; }
    public string? Splash { get; set; }
    public string? SystemChannelId { get; set; }
    public int? SystemChannelFlags { get; set; }
    public bool Unavailable { get; set; }
    public int? VerificationLevel { get; set; }
    public string WelcomeScreen { get; set; } = null!;
    public string? WidgetChannelId { get; set; }
    public bool WidgetEnabled { get; set; }
    public int? NsfwLevel { get; set; }
    public bool Nsfw { get; set; }
    public string? Parent { get; set; }
    public bool? PremiumProgressBarEnabled { get; set; }
    public string ChannelOrdering { get; set; } = null!;

    public int ChannelCount { get; set; }
    public int RoleCount { get; set; }
    public int EmojiCount { get; set; }
    public int StickerCount { get; set; }
    public int InviteCount { get; set; }
    public int MessageCount { get; set; }
    public int BanCount { get; set; }
    public int VoiceStateCount { get; set; }
}