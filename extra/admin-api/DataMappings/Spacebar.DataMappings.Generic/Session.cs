using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.Models.Generic;

namespace Spacebar.DataMappings.Generic;

public static class Session
{
    // TODO activity type
    public static List<JsonObject> GetActivities(this Models.Db.Models.Session session)
    {
        return JsonSerializer.Deserialize<List<JsonObject>>(session.Activities)!;
    }
    
    public static Presence.ClientStatuses GetClientStatuses(this Models.Db.Models.Session session)
    {
        return JsonSerializer.Deserialize<Presence.ClientStatuses>(session.ClientStatus)!;
    }
}