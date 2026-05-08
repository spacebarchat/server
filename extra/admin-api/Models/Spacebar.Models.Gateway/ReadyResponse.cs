using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.Models.Gateway;

public class ReadyResponse {
    /* TODO: _trace, analytics_token, api_code_version, auth_session_id_hash, connected_accounts, consents, country_code, experiments, friend_suggestion_count, game_relationships,
     geo_ordered_rtc_regions, guild_experiments, guild_join_requests*/
    [JsonPropertyName("guilds")]
    public required List<Guild> Guilds { get; set; }
    
    [JsonPropertyName("merged_members")]
    public List<List<Member>> MergedMembers { get; set; }
    
    // TODO: notification_settings
    
    [JsonPropertyName("presences")]
    public List<Presence> Presences { get; set; } // TODO: right type?
    
    [JsonPropertyName("private_channels")]
    public List<Channel> PrivateChannels { get; set; }
    
    [JsonPropertyName("read_state")]
    public object ReadStates { get; set; } // TODO: schemas
    
    [JsonPropertyName("relationships")]
    public List<object> Relationships { get; set; } // TODO: schemas
    
    [JsonPropertyName("resume_gateway_url")]
    public string ResumeGatewayUrl { get; set; }
}

[JsonSourceGenerationOptions()]
[JsonSerializable(typeof(ReadyResponse))]
public partial class ReadyResponseSerializerContext : JsonSerializerContext
{
}