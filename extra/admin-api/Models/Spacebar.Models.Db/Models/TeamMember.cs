using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("team_members")]
public partial class TeamMember
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("membership_state")]
    public int MembershipState { get; set; }

    [Column("permissions")]
    public string Permissions { get; set; } = null!;

    [Column("team_id")]
    public long? TeamId { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("role", TypeName = "character varying")]
    public string Role { get; set; } = null!;

    [ForeignKey("TeamId")]
    [InverseProperty("TeamMembers")]
    public virtual Team? Team { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("TeamMembers")]
    public virtual User? User { get; set; }
}
