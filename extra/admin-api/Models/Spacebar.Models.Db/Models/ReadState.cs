using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("read_states")]
[Index("ChannelId", "UserId", Name = "IDX_0abf8b443321bd3cf7f81ee17a", IsUnique = true)]
public partial class ReadState
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("channel_id")]
    public long ChannelId { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("last_message_id")]
    public long? LastMessageId { get; set; }

    [Column("notifications_cursor", TypeName = "character varying")]
    public string? NotificationsCursor { get; set; }

    [Column("last_pin_timestamp", TypeName = "timestamp without time zone")]
    public DateTime? LastPinTimestamp { get; set; }

    [Column("mention_count")]
    public int MentionCount { get; set; }

    [Column("last_acked_id")]
    public long? LastAckedId { get; set; }

    [Column("badge_count")]
    public int BadgeCount { get; set; }

    [Column("read_state_type")]
    public int ReadStateType { get; set; }

    [Column("flags")]
    public int Flags { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("ReadStates")]
    public virtual Channel Channel { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("ReadStates")]
    public virtual User User { get; set; } = null!;
}
