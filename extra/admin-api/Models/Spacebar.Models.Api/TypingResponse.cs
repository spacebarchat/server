using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class TypingResponse {
    [JsonPropertyName("message_send_cooldown_ms")]
    public int? MessageSendCooldownMilliseconds { get; set; }

    [JsonPropertyName("thread_create_cooldown_ms")]
    public int? ThreadCreateCooldownMilliseconds { get; set; }

    [JsonIgnore]
    public TimeSpan? MessageSendCooldown {
        get => MessageSendCooldownMilliseconds is null ? null : TimeSpan.FromMilliseconds((long)MessageSendCooldownMilliseconds);
        set => MessageSendCooldownMilliseconds = (int?)value?.TotalMilliseconds;
    }
    
    [JsonIgnore]
    public TimeSpan? ThreadCreateCooldown {
        get => ThreadCreateCooldownMilliseconds is null ? null : TimeSpan.FromMilliseconds((long)ThreadCreateCooldownMilliseconds);
        set => ThreadCreateCooldownMilliseconds = (int?)value?.TotalMilliseconds;
    }
}