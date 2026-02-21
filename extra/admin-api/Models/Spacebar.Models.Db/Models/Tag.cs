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
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("channel_id", TypeName = "character varying")]
    public string ChannelId { get; set; } = null!;

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("moderated")]
    public bool Moderated { get; set; }

    [Column("emoji_id", TypeName = "character varying")]
    public string? EmojiId { get; set; }

    [Column("emoji_name", TypeName = "character varying")]
    public string? EmojiName { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("Tags")]
    public virtual Channel Channel { get; set; } = null!;
}
