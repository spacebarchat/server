using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("security_settings")]
public partial class SecuritySetting
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("guild_id")]
    public long? GuildId { get; set; }

    [Column("channel_id")]
    public long? ChannelId { get; set; }

    [Column("encryption_permission_mask")]
    public int EncryptionPermissionMask { get; set; }

    [Column("allowed_algorithms")]
    public string AllowedAlgorithms { get; set; } = null!;

    [Column("current_algorithm", TypeName = "character varying")]
    public string CurrentAlgorithm { get; set; } = null!;

    [Column("used_since_message", TypeName = "character varying")]
    public string? UsedSinceMessage { get; set; }
}
