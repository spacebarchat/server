using System.Text.Json.Serialization;

namespace Spacebar.Models.AdminApi;

public class ForceJoinRequest {
    [JsonPropertyName("user_id")]
    public string? UserId { get; set; } = null!;
    [JsonPropertyName("make_admin")]
    public bool MakeAdmin { get; set; } = false;
    [JsonPropertyName("make_owner")]
    public bool MakeOwner { get; set; } = false;
}