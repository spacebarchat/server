using System.Diagnostics;
using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.Models.Api;

[DebuggerDisplay("{Id} ({Name})")]
public class DiscoverableGuild {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("banner")]
    public string? Banner { get; set; }
    
    [JsonPropertyName("discovery_splash")]
    public string? DiscoverySplash { get; set; }

    [JsonPropertyName("emojis")]
    public List<Emoji> Emojis { get; set; }
    
    [JsonPropertyName("emoji_count")]
    public int EmojiCount { get; set; }

    [JsonPropertyName("features")]
    public List<string> Features { get; set; }
    
    [JsonPropertyName("preferred_locale")]
    public string PreferredLocale { get; set; }

    [JsonPropertyName("premium_subscription_count")]
    public int PremiumSubscriptionCount { get; set; }

    [JsonPropertyName("splash")]
    public string? Splash { get; set; }

    [JsonPropertyName("stickers")]
    public List<Sticker> Stickers { get; set; }
    
    [JsonPropertyName("sticker_count")]
    public int StickerCount { get; set; }
    
    [JsonPropertyName("vanity_url_code")]
    public string? VanityUrlCode { get; set; }
    
    [JsonPropertyName("approximate_member_count")]
    public int ApproximateMemberCount { get; set; }
    
    [JsonPropertyName("approximate_presence_count")]
    public int ApproximatePresenceCount { get; set; }
    
    [JsonPropertyName("auto_removed")]
    public bool AutoRemoved { get; set; }
    
    [JsonPropertyName("primary_category_id")]
    public short PrimaryCategoryId { get; set; }
    
    [JsonPropertyName("primary_category")]
    public DiscoveryCategory PrimaryCategory { get; set; }
    
    [JsonPropertyName("keywords")]
    public List<string> Keywords { get; set; }
    
    [JsonPropertyName("is_published")]
    public bool IsPublished { get; set; }
    
    [JsonPropertyName("reasons_to_join")]
    public List<DiscoveryReason> ReasonsToJoin { get; set; }
    
    [JsonPropertyName("social_links")]
    public List<string> SocialLinks { get; set; }
    
    [JsonPropertyName("about")]
    public string About { get; set; }
    
    [JsonPropertyName("category_ids")]
    public List<short> CategoryIds { get; set; }

    [JsonPropertyName("categories")]
    public List<DiscoveryCategory> Categories { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("nsfw_properties")]
    public DiscoveryNsfwProperties NsfwProperties { get; set; }
}

public class DiscoveryCategory {
    public short Id { get; set; }
    public string Name { get; set; }
    public bool IsPrimary { get; set; }
}

public class DiscoveryReason {
    
}

public class DiscoveryNsfwProperties {
    
}
