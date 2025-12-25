using System.Text.Json.Serialization;

namespace DiscordEmojiConverter;

public class DiscordEmojiJson {
    [JsonPropertyName("emojis")]
    public List<DiscordEmoji>? Emojis { get; set; }

    [JsonPropertyName("emojisByCategory")]
    public Dictionary<string, List<int>>? EmojisByCategory { get; set; }

    [JsonPropertyName("nameToEmoji")]
    public Dictionary<string, int>? NameToEmoji { get; set; }

    [JsonPropertyName("surrogateToEmoji")]
    public Dictionary<string, int>? SurrogateToEmoji { get; set; }

    [JsonPropertyName("numDiversitySprites")]
    public int? NumDiversitySprites { get; set; }

    [JsonPropertyName("numNonDiversitySprites")]
    public int? NumNonDiversitySprites { get; set; }
}

public class DiscordEmoji {
    [JsonPropertyName("names")]
    public List<string>? Names { get; set; }

    [JsonPropertyName("surrogates")]
    public string? Surrogates { get; set; }

    [JsonPropertyName("unicodeVersion")]
    public float? UnicodeVersion { get; set; }

    [JsonPropertyName("spriteIndex")]
    public int? SpriteIndex { get; set; }

    [JsonPropertyName("hasMultiDiversity")]
    public bool? HasMultiDiversity { get; set; }

    [JsonPropertyName("hasMultiDiversityParent")]
    public bool? HasMultiDiversityParent { get; set; }

    [JsonPropertyName("hasDiversity")]
    public bool? HasDiversity { get; set; }

    [JsonPropertyName("hasDiversityParent")]
    public bool? HasDiversityParent { get; set; }

    [JsonPropertyName("diversityChildren")]
    public List<int>? DiversityChildren { get; set; }

    [JsonPropertyName("diversity")]
    public List<string>? Diversity { get; set; }
}