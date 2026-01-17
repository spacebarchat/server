using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("sessions")]
[Index("UserId", Name = "IDX_085d540d9f418cfbdc7bd55bb1")]
public partial class Session
{
    [Column("user_id", TypeName = "character varying")]
    public string UserId { get; set; } = null!;

    [Key]
    [Column("session_id", TypeName = "character varying")]
    public string SessionId { get; set; } = null!;

    [Column("activities")]
    public string Activities { get; set; } = null!;

    [Column("client_info")]
    public string ClientInfo { get; set; } = null!;

    [Column("status", TypeName = "character varying")]
    public string Status { get; set; } = null!;

    [Column("client_status")]
    public string ClientStatus { get; set; } = null!;

    [Column("is_admin_session")]
    public bool IsAdminSession { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime CreatedAt { get; set; }

    [Column("last_seen", TypeName = "timestamp without time zone")]
    public DateTime? LastSeen { get; set; }

    [Column("last_seen_ip", TypeName = "character varying")]
    public string? LastSeenIp { get; set; }

    [Column("last_seen_location", TypeName = "character varying")]
    public string? LastSeenLocation { get; set; }

    [Column("last_seen_location_info")]
    public string? LastSeenLocationInfo { get; set; }

    [Column("session_nickname", TypeName = "character varying")]
    public string? SessionNickname { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Sessions")]
    public virtual User User { get; set; } = null!;
}
