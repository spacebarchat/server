using System.Text.Json.Serialization;

namespace Spacebar.AdminApi.Models;

public class FileMetadataModel {
    public string UserId { get; set; } = null!;
    public string Id { get; set; } = null!;
    
    [JsonConverter(typeof(JsonStringEnumConverter<FileUploadType>))]
    public FileUploadType Type { get; set; }


    public enum FileUploadType {
        Attachment,
        Avatar,
        Banner,
        GuildIcon,
        GuildSplash,
        GuildCover,
        Emoji,
        Sticker
    }
}