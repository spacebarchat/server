namespace Spacebar.Models.AdminApi;

public class StickerModel {
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool? Available { get; set; }
    public string? Tags { get; set; }
    public string? PackId { get; set; }
    public string? GuildId { get; set; }
    public string? UserId { get; set; }
    public int Type { get; set; }
    public int FormatType { get; set; }
    // public virtual Guild? Guild { get; set; }
    // public virtual StickerPack? Pack { get; set; }
    // public virtual ICollection<StickerPack> StickerPacks { get; set; } = new List<StickerPack>();
    // public virtual User? User { get; set; }
    // public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}