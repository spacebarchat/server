using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("embed_cache")]
public partial class EmbedCache
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("url", TypeName = "character varying")]
    public string Url { get; set; } = null!;

    [Column("embed", TypeName = "jsonb")]
    public string? Embed { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("embeds", TypeName = "jsonb")]
    public string? Embeds { get; set; }
}
