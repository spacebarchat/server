using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("report_menus")]
public partial class ReportMenu
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("type")]
    public int Type { get; set; }

    [Column("variant", TypeName = "character varying")]
    public string Variant { get; set; } = null!;

    [Column("isCurrent")]
    public bool IsCurrent { get; set; }

    [Column("inherits", TypeName = "character varying")]
    public string? Inherits { get; set; }

    [Column("content", TypeName = "jsonb")]
    public string Content { get; set; } = null!;
}
