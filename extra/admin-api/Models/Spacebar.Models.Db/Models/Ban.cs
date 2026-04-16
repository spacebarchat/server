using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("bans")]
public partial class Ban
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("guild_id")]
    public long? GuildId { get; set; }

    [Column("executor_id")]
    public long? ExecutorId { get; set; }

    [Column("ip", TypeName = "character varying")]
    public string? Ip { get; set; }

    [Column("reason", TypeName = "character varying")]
    public string? Reason { get; set; }

    [ForeignKey("ExecutorId")]
    [InverseProperty("BanExecutors")]
    public virtual User? Executor { get; set; }

    [ForeignKey("GuildId")]
    [InverseProperty("Bans")]
    public virtual Guild? Guild { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("BanUsers")]
    public virtual User? User { get; set; }
}
