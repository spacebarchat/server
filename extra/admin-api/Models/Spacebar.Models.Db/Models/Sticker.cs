using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("stickers")]
public partial class Sticker
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("description", TypeName = "character varying")]
    public string? Description { get; set; }

    [Column("available")]
    public bool? Available { get; set; }

    [Column("tags", TypeName = "character varying")]
    public string? Tags { get; set; }

    [Column("pack_id")]
    public long? PackId { get; set; }

    [Column("guild_id")]
    public long? GuildId { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("type")]
    public int Type { get; set; }

    [Column("format_type")]
    public int FormatType { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Stickers")]
    public virtual Guild? Guild { get; set; }

    [ForeignKey("PackId")]
    [InverseProperty("Stickers")]
    public virtual StickerPack? Pack { get; set; }

    [InverseProperty("CoverStickerId1Navigation")]
    public virtual ICollection<StickerPack> StickerPacks { get; set; } = new List<StickerPack>();

    [ForeignKey("UserId")]
    [InverseProperty("Stickers")]
    public virtual User? User { get; set; }

    [ForeignKey("StickersId")]
    [InverseProperty("Stickers")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
