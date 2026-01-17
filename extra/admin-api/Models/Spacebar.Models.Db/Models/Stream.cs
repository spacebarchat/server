using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("streams")]
public partial class Stream
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("owner_id", TypeName = "character varying")]
    public string OwnerId { get; set; } = null!;

    [Column("channel_id", TypeName = "character varying")]
    public string ChannelId { get; set; } = null!;

    [Column("endpoint", TypeName = "character varying")]
    public string Endpoint { get; set; } = null!;

    [ForeignKey("ChannelId")]
    [InverseProperty("Streams")]
    public virtual Channel Channel { get; set; } = null!;

    [ForeignKey("OwnerId")]
    [InverseProperty("Streams")]
    public virtual User Owner { get; set; } = null!;

    [InverseProperty("Stream")]
    public virtual ICollection<StreamSession> StreamSessions { get; set; } = new List<StreamSession>();
}
