using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace Spacebar.AdminApi.PrepareTestData.TestDataTypes;

public class AttachmentSpamTestData : ITestData {
    public static async Task Run() {
        using var hc = new HttpClient();
        var token = await Utils.CreateUser();
        hc.DefaultRequestHeaders.Authorization = new("Bearer", token);

        int guildCount = 1;
        int channelCount = 100;  // per guild
        int messageCount = 1000; // per channel

        for (int guild = 0; guild < guildCount; guild++) {
            var guildId = await Utils.CreateGuild(token);
            // for (int channel = 0; channel < channelCount; channel++) {
            //     Console.WriteLine($"> Creating channel {channel} in guild {guild}...");
            //     var channelRequest = await hc.PostAsJsonAsync($"http://localhost:3001/api/v9/guilds/{guildId}/channels", new {
            //         name = Guid.NewGuid().ToString()[0..30],
            //         type = 0
            //     });
            //     var channelResponse = await channelRequest.Content.ReadFromJsonAsync<JsonObject>();
            //     var channelId = channelResponse!["id"]!.ToString();
            //     await SendMessages(hc, channelId, messageCount);
            // }
            
            var ss = new SemaphoreSlim(16,16);
            var tasks = Enumerable.Range(0, channelCount).Select(async channel => {
                await ss.WaitAsync();
                Console.WriteLine($"> Creating channel {channel} in guild {guildId}...");
                var channelRequest = await hc.PostAsJsonAsync($"{Constants.ApiBaseUrl}/guilds/{guildId}/channels", new {
                    name = Guid.NewGuid().ToString()[0..30],
                    type = 0
                });
                var channelResponse = await channelRequest.Content.ReadFromJsonAsync<JsonObject>();
                var channelId = channelResponse!["id"]!.ToString();
                await SendMessages(hc, channelId, messageCount);
                ss.Release();
            });
            await Task.WhenAll(tasks);
        }
    }
    
    private static async Task CreateChannels(HttpClient hc, string guildId, int channelCount) {
        var tasks = Enumerable.Range(0, channelCount).Select(async channel => {
            Console.WriteLine($"> Creating channel {channel} in guild {guildId}...");
            var channelRequest = await hc.PostAsJsonAsync($"http://localhost:3001/api/v9/guilds/{guildId}/channels", new {
                name = Guid.NewGuid().ToString()[0..30],
                type = 0
            });
            var channelResponse = await channelRequest.Content.ReadFromJsonAsync<JsonObject>();
        });
        await Task.WhenAll(tasks);
    }

    private static async Task SendMessages(HttpClient hc, string channelId, int maxMessageCount) {
        // var ss = new SemaphoreSlim(32, 32);
        // var tasks = Enumerable.Range(0, Random.Shared.Next((int)(0.75 * maxMessageCount), maxMessageCount)).Select(async message => {
        //     var success = false;
        //     while (!success) {
        //         await ss.WaitAsync();
        //         Console.WriteLine($"> Sending message {message} in channel {channelId}...");
        //         var messageReq = await hc.PostAsJsonAsync($"http://localhost:3001/api/v9/channels/{channelId}/messages", new {
        //             content = Guid.NewGuid().ToString()
        //         });
        //         var messageResponse = await messageReq.Content.ReadFromJsonAsync<JsonObject>();
        //         if (messageResponse.ContainsKey("id")) {
        //             success = true;
        //             Console.WriteLine(messageResponse!["id"]!.ToString());
        //         }
        //     }
        //
        //     ss.Release();
        // });
        // await Task.WhenAll(tasks);
        
        var messageReq = await hc.PostAsJsonAsync($"http://localhost:3001/api/v9/channels/{channelId}/messages", new {
            content = Guid.NewGuid().ToString()
        });
        var messageResponse = await messageReq.Content.ReadFromJsonAsync<JsonObject>();
        if (messageResponse.ContainsKey("id")) {
            await hc.GetAsync($"http://localhost:5112/Users/duplicate/{messageResponse!["id"]!.ToString()}?count={maxMessageCount}");
        }
    }
}