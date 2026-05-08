using System.Text.Json.Serialization;
using ArcaneLibs.Blazor.Components.Services;

namespace Spacebar.Client.WebCore;

public class SessionStore(ILogger<SessionStore> logger, LocalStorageService localStorage) {
    public const string CurrentSessionKey = "chat.spacebar.client.current_session";
    public const string AllSessionsKey = "chat.spacebar.client.sessions";
    public async Task<SessionEntry?> GetCurrentSessionAsync() {
        if (!await localStorage.ContainsKeyAsync(CurrentSessionKey)) return null;
        var entryId = await localStorage.GetItemFromJsonAsync<Guid>(CurrentSessionKey);
        var entries = await GetAllSessionsAsync();
        return entries[entryId];
    }

    public async Task<Dictionary<Guid, SessionEntry>> GetAllSessionsAsync() {
        if (!await localStorage.ContainsKeyAsync(AllSessionsKey)) return [];
        var data = await localStorage.GetItemFromJsonAsync<Dictionary<Guid, SessionEntry>>(AllSessionsKey);
        return data ?? [];
    }

    public async Task AddSession(SessionEntry sessionEntry, bool setCurrent = false) {
        var sessions = await GetAllSessionsAsync();
        var newId = Guid.NewGuid();
        sessions.Add(newId, sessionEntry);
        await localStorage.SetItemAsJsonAsync(AllSessionsKey, sessions);

        if (setCurrent) {
            await localStorage.SetItemAsJsonAsync(CurrentSessionKey, newId);
        }
    }

    public async Task SetCurrentSessionAsync(Guid sessionId) {
        await localStorage.SetItemAsJsonAsync(CurrentSessionKey, sessionId);
    }
}

public class SessionEntry {
    [JsonPropertyName("server_name")]
    public required string ServerName { get; set; }

    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("profile_cache")]
    public required ProfileCacheData? ProfileCache { get; set; }

    public class ProfileCacheData {
        [JsonPropertyName("id"), JsonNumberHandling(JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString)]
        public required long Id { get; set; }

        [JsonPropertyName("username")]
        public required string Username { get; set; }

        [JsonPropertyName("discriminator")]
        public string? Discriminator { get; set; }

        [JsonPropertyName("avatar_url")]
        public required string AvatarUrl { get; set; }
    }
}