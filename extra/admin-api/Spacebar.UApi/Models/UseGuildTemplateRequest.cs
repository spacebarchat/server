using System.Text.Json.Serialization;

namespace Spacebar.UApi.Models;

public class UseGuildTemplateRequest {
    /// <summary>
    /// Data URI encoded image
    /// </summary>
    [JsonPropertyName("icon")]
    public string? Icon { get; set; }
    
    [JsonPropertyName("name")]
    public string Name { get; set; }
}