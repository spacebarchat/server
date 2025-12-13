using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Db.Models;

[Table("application_commands")]
public partial class ApplicationCommand
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("type")]
    public int Type { get; set; }

    [Column("application_id", TypeName = "character varying")]
    public string ApplicationId { get; set; } = null!;

    [Column("guild_id", TypeName = "character varying")]
    public string? GuildId { get; set; }

    [Column("name", TypeName = "character varying")]
    public string Name { get; set; } = null!;

    [Column("name_localizations")]
    public string? NameLocalizations { get; set; }

    [Column("description", TypeName = "character varying")]
    public string Description { get; set; } = null!;

    [Column("description_localizations")]
    public string? DescriptionLocalizations { get; set; }

    [Column("options")]
    public string Options { get; set; } = null!;

    [Column("default_member_permissions", TypeName = "character varying")]
    public string? DefaultMemberPermissions { get; set; }

    [Column("dm_permission")]
    public bool DmPermission { get; set; }

    [Column("permissions")]
    public string? Permissions { get; set; }

    [Column("nsfw")]
    public bool Nsfw { get; set; }

    [Column("integration_types")]
    public string? IntegrationTypes { get; set; }

    [Column("global_popularity_rank")]
    public int GlobalPopularityRank { get; set; }

    [Column("contexts")]
    public string? Contexts { get; set; }

    [Column("version", TypeName = "character varying")]
    public string Version { get; set; } = null!;

    [Column("handler")]
    public int Handler { get; set; }
}
