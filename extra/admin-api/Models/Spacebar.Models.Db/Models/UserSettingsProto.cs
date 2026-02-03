using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("user_settings_protos")]
public partial class UserSettingsProto
{
    [Key]
    [Column("user_id", TypeName = "character varying")]
    public string UserId { get; set; } = null!;

    [Column("userSettings", TypeName = "character varying")]
    public string? UserSettings { get; set; }

    [Column("frecencySettings", TypeName = "character varying")]
    public string? FrecencySettings { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserSettingsProto")]
    public virtual User User { get; set; } = null!;
}
