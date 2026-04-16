using System.Text.Json.Serialization;

namespace Spacebar.Models.AdminApi;

public class StickerModel {
    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public required long Id { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool? Available { get; set; }
    public string? Tags { get; set; }

    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? PackId { get; set; }

    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? GuildId { get; set; }

    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
    public long? UserId { get; set; }

    public int Type { get; set; }

    public int FormatType { get; set; }
    // public virtual Guild? Guild { get; set; }
    // public virtual StickerPack? Pack { get; set; }
    // public virtual ICollection<StickerPack> StickerPacks { get; set; } = new List<StickerPack>();
    // public virtual User? User { get; set; }
    // public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}