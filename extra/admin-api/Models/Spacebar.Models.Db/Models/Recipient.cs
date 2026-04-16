using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("recipients")]
public partial class Recipient
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("channel_id")]
    public long ChannelId { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }

    [Column("closed")]
    public bool Closed { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("Recipients")]
    public virtual Channel Channel { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Recipients")]
    public virtual User User { get; set; } = null!;
}
