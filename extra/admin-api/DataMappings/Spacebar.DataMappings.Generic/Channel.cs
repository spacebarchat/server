using System.Text.Json;
using System.Text.Json.Serialization;
using Spacebar.Models.Generic;

namespace Spacebar.DataMappings.Generic;

public static class Channel {
    extension(Models.Db.Models.Channel channel) {
        [JsonIgnore]
        public IEnumerable<ChannelPermissionOverwrite>? MappedPermissionOverwrites =>
            channel.PermissionOverwrites is null ? [] : JsonSerializer.Deserialize<List<ChannelPermissionOverwrite>>(channel.PermissionOverwrites);
    }
}