using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class Sticker {
    [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("tags")]
    public string Tags { get; set; }

    [JsonPropertyName("available")]
    public bool Available { get; set; }

    [JsonPropertyName("type")]
    public StickerType Type { get; set; }

    [JsonPropertyName("format_type")]
    public StickerFormatType FormatType { get; set; }
}

public enum StickerType {
    Standard = 1,
    Guild = 2
}

public enum StickerFormatType {
    Png = 1,
    Apng = 2,
    Lottie = 3,
    Gif = 4
}