using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class GeneralConfiguration {
    [JsonPropertyName("instanceName")]
    public string InstanceName { get; set; } = "Spacebar Instance";

    [JsonPropertyName("serverName")]
    public string? ServerName { get; set; } = null;

    [JsonPropertyName("instanceDescription")]
    public string InstanceDescription { get; set; } = "This is a Spacebar instance made in the pre-release days";

    [JsonPropertyName("frontPage")]
    public string? FrontPage { get; set; } = null;

    [JsonPropertyName("tosPage")]
    public string? TosPage { get; set; } = null;

    [JsonPropertyName("correspondenceEmail")]
    public string? CorrespondenceEmail { get; set; } = null;

    [JsonPropertyName("correspondenceUserID")]
    public string? CorrespondenceUserID { get; set; } = null;

    [JsonPropertyName("image")]
    public string? Image { get; set; } = null;

    [JsonPropertyName("instanceId")]
    public string InstanceId { get; set; } = null!; // {get;set;}=Snowflake.generate();

    [JsonPropertyName("autoCreateBotUsers")]
    public bool AutoCreateBotUsers { get; set; } = false;
}