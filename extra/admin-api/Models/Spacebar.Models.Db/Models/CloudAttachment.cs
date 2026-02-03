using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Spacebar.Models.Db.Models;

[Table("cloud_attachments")]
public partial class CloudAttachment
{
    [Key]
    [Column("id", TypeName = "character varying")]
    public string Id { get; set; } = null!;

    [Column("user_id", TypeName = "character varying")]
    public string? UserId { get; set; }

    [Column("channel_id", TypeName = "character varying")]
    public string? ChannelId { get; set; }

    [Column("upload_filename", TypeName = "character varying")]
    public string UploadFilename { get; set; } = null!;

    [Column("user_attachment_id", TypeName = "character varying")]
    public string? UserAttachmentId { get; set; }

    [Column("user_filename", TypeName = "character varying")]
    public string UserFilename { get; set; } = null!;

    [Column("user_file_size")]
    public int? UserFileSize { get; set; }

    [Column("user_original_content_type", TypeName = "character varying")]
    public string? UserOriginalContentType { get; set; }

    [Column("user_is_clip")]
    public bool? UserIsClip { get; set; }

    [Column("size")]
    public int? Size { get; set; }

    [Column("height")]
    public int? Height { get; set; }

    [Column("width")]
    public int? Width { get; set; }

    [Column("content_type", TypeName = "character varying")]
    public string? ContentType { get; set; }

    [ForeignKey("ChannelId")]
    [InverseProperty("CloudAttachments")]
    public virtual Channel? Channel { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("CloudAttachments")]
    public virtual User? User { get; set; }
}
