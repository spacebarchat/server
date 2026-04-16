using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("teams")]
public partial class Team
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("icon", TypeName = "character varying")]
    public string? Icon { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("owner_user_id")]
    public long? OwnerUserId { get; set; }

    [InverseProperty("Team")]
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    [ForeignKey("OwnerUserId")]
    [InverseProperty("Teams")]
    public virtual User? OwnerUser { get; set; }

    [InverseProperty("Team")]
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}
