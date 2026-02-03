using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("thread_members")]
[Index("Id", "MemberIdx", Name = "IDX_38d4f704373da3f0dc9b352ac9", IsUnique = true)]
public partial class ThreadMember
{
    [Key]
    [Column("index")]
    public int Index { get; set; }

    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("member_idx")]
    public int MemberIdx { get; set; }

    [Column("join_timestamp", TypeName = "timestamp without time zone")]
    public DateTime JoinTimestamp { get; set; }

    [Column("muted")]
    public bool Muted { get; set; }

    [Column("mute_config")]
    public string? MuteConfig { get; set; }

    [Column("flags")]
    public int Flags { get; set; }

    [ForeignKey("Id")]
    [InverseProperty("ThreadMembers")]
    public virtual Channel IdNavigation { get; set; } = null!;

    [ForeignKey("MemberIdx")]
    [InverseProperty("ThreadMembers")]
    public virtual Member MemberIdxNavigation { get; set; } = null!;
}
