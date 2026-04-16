using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("audit_logs")]
public partial class AuditLog
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("action_type")]
    public int ActionType { get; set; }

    [Column("options", TypeName = "jsonb")]
    public string? Options { get; set; }

    [Column("changes", TypeName = "jsonb")]
    public string Changes { get; set; } = null!;

    [Column("reason", TypeName = "character varying")]
    public string? Reason { get; set; }

    [Column("target_id")]
    public long? TargetId { get; set; }

    [ForeignKey("TargetId")]
    [InverseProperty("AuditLogTargets")]
    public virtual User? Target { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AuditLogUsers")]
    public virtual User? User { get; set; }
}
