using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using ArcaneLibs.Extensions;

namespace Spacebar.AdminApi.PrepareTestData;

public static class Utils {
    public static async Task<string> CreateUser() {
        Console.WriteLine("> Creating user...");
        using var hc = new HttpClient();
        var registerRequest = await hc.PostAsJsonAsync($"{Constants.ApiBaseUrl}/auth/register", new {
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
        var guildRequest = await hc.PostAsJsonAsync($"{Constants.ApiBaseUrl}/guilds", new {
            name = Guid.NewGuid().ToString()[..30]
        });

        var guildResponse = await guildRequest.Content.ReadFromJsonAsync<JsonObject>();
        var guildId = guildResponse!["id"]!.ToString();
        return guildId;
    }

    public static async Task PostFileWithDataAsync(string url, string token, object data, byte[] file, string filename, string contentType) {
        try {
            using var hc = new HttpClient();
            hc.DefaultRequestHeaders.Authorization = new("Bearer", token);
            var f = new MultipartFormDataContent();
            // f.Add(new StringContent());
            f.Add(JsonContent.Create(data), "payload_json");
            f.Add(new ByteArrayContent(file) {
                Headers = { ContentType = new MediaTypeHeaderValue(contentType) }
            }, "files[0]", filename);

            var _resp = await hc.PostAsync(url, f);
            var resp = await _resp.Content.ReadAsStringAsync();

            Console.WriteLine(resp);
        }
        catch (Exception e) {
            Console.WriteLine(e);
            throw;
        }
    }
}