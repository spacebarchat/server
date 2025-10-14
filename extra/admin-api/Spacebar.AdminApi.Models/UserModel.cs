using System.Text.Json.Serialization;

namespace Spacebar.AdminApi.Models;

public class UserModel {
    public string Id { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Discriminator { get; set; } = null!;
    public string? Avatar { get; set; }
    public int? AccentColor { get; set; }
    public string? Banner { get; set; }
    public string? ThemeColors { get; set; }
    public string? Pronouns { get; set; }
    public string? Phone { get; set; }
    public bool Desktop { get; set; }
    public bool Mobile { get; set; }
    public bool Premium { get; set; }
    public int PremiumType { get; set; }
    public bool Bot { get; set; }
    public string Bio { get; set; } = null!;
    public bool System { get; set; }
    public bool NsfwAllowed { get; set; }
    public bool MfaEnabled { get; set; }
    public bool WebauthnEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PremiumSince { get; set; }
    public bool Verified { get; set; }
    public bool Disabled { get; set; }
    public bool Deleted { get; set; }
    public string? Email { get; set; }

    [JsonNumberHandling(JsonNumberHandling.WriteAsString | JsonNumberHandling.AllowReadingFromString)]
    public ulong Flags { get; set; }

    [JsonNumberHandling(JsonNumberHandling.WriteAsString | JsonNumberHandling.AllowReadingFromString)]
    public ulong PublicFlags { get; set; }

    [JsonNumberHandling(JsonNumberHandling.WriteAsString | JsonNumberHandling.AllowReadingFromString)]
    public ulong Rights { get; set; }

    public ApplicationModel? ApplicationBotUser { get; set; }
    public List<ConnectedAccountModel> ConnectedAccounts { get; set; } = new();
    public int GuildCount { get; set; }
    public int OwnedGuildCount { get; set; }
    public int SessionCount { get; set; }
    public int TemplateCount { get; set; }
    public int VoiceStateCount { get; set; }
    public int MessageCount { get; set; }

    public class ConnectedAccountModel {
        public string Id { get; set; } = null!;
        public string ExternalId { get; set; } = null!;
        public string? UserId { get; set; }
        public bool FriendSync { get; set; }
        public string Name { get; set; } = null!;
        public bool Revoked { get; set; }
        public int ShowActivity { get; set; }
        public string Type { get; set; } = null!;
        public bool Verified { get; set; }
        public int Visibility { get; set; }
        public string Integrations { get; set; } = null!;
        public string? Metadata { get; set; }
        public int MetadataVisibility { get; set; }
        public bool TwoWayLink { get; set; }
    }
}