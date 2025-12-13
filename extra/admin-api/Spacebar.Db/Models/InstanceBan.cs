using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("instance_bans")]
[Index("OriginInstanceBanId", Name = "REL_0b02d18d0d830f160c921192a3", IsUnique = true)]
public partial class InstanceBan
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("reason", TypeName = "character varying")]
    public string Reason { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("fingerprint", TypeName = "character varying")]
    public string? Fingerprint { get; set; }

    [Column("ip_address", TypeName = "character varying")]
    public string? IpAddress { get; set; }

    [Column("is_from_other_instance_ban")]
    public bool IsFromOtherInstanceBan { get; set; }

    [Column("origin_instance_ban_id", TypeName = "character varying")]
    public string? OriginInstanceBanId { get; set; }

    [Column("is_allowlisted")]
    public bool IsAllowlisted { get; set; }

    [InverseProperty("OriginInstanceBan")]
    public virtual InstanceBan? InverseOriginInstanceBan { get; set; }

    [ForeignKey("OriginInstanceBanId")]
    [InverseProperty("InverseOriginInstanceBan")]
    public virtual InstanceBan? OriginInstanceBan { get; set; }
}
