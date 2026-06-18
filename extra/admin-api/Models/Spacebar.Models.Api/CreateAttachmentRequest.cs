using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class CreateAttachmentRequest {
    [JsonPropertyName("files")]
    public required List<Entry> Files { get; set; }

    public class Entry {
        [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public long? Id { get; set; }

        [JsonPropertyName("filename")]
        public string? FileName { get; set; }

        [JsonPropertyName("file_size")]
        public int FileSize { get; set; }

        [JsonPropertyName("is_clip")]
        public bool? IsClip { get; set; }
    }
}

public class CreateAttachmentResponse {
    [JsonPropertyName("attachments")]
    public required List<Entry> Attachments { get; set; }

    public class Entry {
        [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public long? Id { get; set; }

        [JsonPropertyName("upload_filename")]
        public string? UploadFileName { get; set; }

        [JsonPropertyName("upload_url")]
        public string UploadUrl { get; set; }

        [JsonPropertyName("original_content_type")]
        public string? OriginalContentType { get; set; }
    }
}