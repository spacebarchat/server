using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("tags")]
public partial class Tag
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("channel_id")]
    public long ChannelId { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("moderated")]
    public bool Moderated { get; set; }

    [Column("emoji_id")]
    public long? EmojiId { get; set; }

    [Column("emoji_name", TypeName = "character varying")]
    public string? EmojiName { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("Tags")]
    public virtual Channel Channel { get; set; } = null!;
}
