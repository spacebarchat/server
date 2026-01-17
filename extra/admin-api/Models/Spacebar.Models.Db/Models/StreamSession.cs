using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("stream_sessions")]
public partial class StreamSession
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("stream_id", TypeName = "character varying")]
    public string StreamId { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string UserId { get; set; } = null!;

    [Column("token", TypeName = "character varying")]
    public string? Token { get; set; }

    [Column("session_id", TypeName = "character varying")]
    public string SessionId { get; set; } = null!;

    [Column("used")]
    public bool Used { get; set; }

    [ForeignKey("StreamId")]
    [InverseProperty("StreamSessions")]
    public virtual Stream Stream { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("StreamSessions")]
    public virtual User User { get; set; } = null!;
}
