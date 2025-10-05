using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("automod_rules")]
public partial class AutomodRule
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("enabled")]
    public bool Enabled { get; set; }

    [Column("event_type")]
    public int EventType { get; set; }

    [Column("exempt_channels")]
    public string ExemptChannels { get; set; } = null!;

    [Column("exempt_roles")]
    public string ExemptRoles { get; set; } = null!;

    [Column("guild_id", TypeName = "character varying")]
    public string GuildId { get; set; } = null!;

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("position")]
    public int Position { get; set; }

    [Column("trigger_type")]
    public int TriggerType { get; set; }

    [Column("trigger_metadata")]
    public string? TriggerMetadata { get; set; }

    [Column("actions")]
    public string Actions { get; set; } = null!;

    [Column("creator_id", TypeName = "character varying")]
    public string? CreatorId { get; set; }

    [ForeignKey("CreatorId")]
    [InverseProperty("AutomodRules")]
    public virtual User? Creator { get; set; }
}
