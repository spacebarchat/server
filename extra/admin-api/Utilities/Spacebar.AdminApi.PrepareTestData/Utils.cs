using System.Net.Http.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;

namespace Spacebar.AdminApi.PrepareTestData;

public static class Utils {
    public static async Task<string> CreateUser() {
        Console.WriteLine("> Creating user...");
        using var hc = new HttpClient();
        var registerRequest = await hc.PostAsJsonAsync("http://localhost:3001/api/v9/auth/register", new {
            username = Guid.NewGuid().ToString()[0..30],
            password = "password",
            email = $"{Guid.NewGuid()}@example.com",
            consent = true,
            date_of_birth = "2000-01-01",
        });
        var registerResponse = await registerRequest.Content.ReadFromJsonAsync<JsonObject>();
        return registerResponse!["token"]!.ToString();
    }

    public static async Task<string> CreateGuild(string token) {
        using var hc = new HttpClient();
        hc.DefaultRequestHeaders.Authorization = new("Bearer", token);
        
        Console.WriteLine("> Creating guild...");
        var guildRequest = await hc.PostAsJsonAsync("http://localhost:3001/api/v9/guilds", new {
            name = Guid.NewGuid().ToString()[0..30]
        });
        
        var guildResponse = await guildRequest.Content.ReadFromJsonAsync<JsonObject>();
        var guildId = guildResponse!["id"]!.ToString();
        return guildId;
    }
}