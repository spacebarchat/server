using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("attachments")]
public partial class Attachment
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("filename", TypeName = "character varying")]
    public string Filename { get; set; } = null!;

    [Column("size")]
    public int Size { get; set; }

    [Column("height")]
    public int? Height { get; set; }

    [Column("width")]
    public int? Width { get; set; }

    [Column("content_type", TypeName = "character varying")]
    public string? ContentType { get; set; }

    [Column("message_id")]
    public long? MessageId { get; set; }

    [Column("channel_id")]
    public long? ChannelId { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("Attachments")]
    public virtual Channel? Channel { get; set; }

    [ForeignKey("MessageId")]
    [InverseProperty("Attachments")]
    public virtual Message? Message { get; set; }
}
