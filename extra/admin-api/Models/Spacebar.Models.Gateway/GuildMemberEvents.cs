using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.Models.Gateway;

public class GuildMemberEvents {
    public class Add : Member {
        [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public long GuildId { get; set; }
    }

    public class Update {
        [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public long GuildId { get; set; }

        [JsonPropertyName("user")]
        public PartialUser User { get; set; } // TODO: not partial
        
        [JsonPropertyName("roles"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public List<long> Roles { get; set; }
        
        [JsonPropertyName("nick")]
        public string? Nick { get; set; }
        
        [JsonPropertyName("joined_at")]
        public DateTime? JoinedAt { get; set; }
        
        [JsonPropertyName("premium_since")]
        public DateTime? PremiumSince { get; set; } // TODO serialise as unix?
        
        [JsonPropertyName("pending")]
        public bool? Pending { get; set; }
    }

    public class Remove {
        [JsonPropertyName("guild_id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public long GuildId { get; set; }

        [JsonPropertyName("user")]
        public PartialUser User { get; set; } // TODO: not partial
    }
}