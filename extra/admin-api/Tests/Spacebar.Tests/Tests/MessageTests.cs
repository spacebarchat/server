using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.Api;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class MessageTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client = null!;
    private static SpacebarClientGuild? Guild;
    private static SpacebarClientChannel? Channel = null!;

    public async ValueTask InitializeAsync() {
        Client = await _userAbstraction.GetSharedUser();

        if (Guild is null)
            await Client.CreateGuild(new() {
                Name = "Test guild"
            }).ContinueWith(g => {
                Assert.Equal("Test guild", g.Result.Name);
                Guild = Client.GetGuild(g.Result.Id);
            });

        if (Channel is null)
            await Guild!.CreateChannelAsync(new() {
                Name = "test",
                Type = 0
            }).ContinueWith(c => {
                Assert.Equal("test", c.Result.Name);
                Channel = Client.GetChannel(c.Result.Id);
            });
    }

    [Fact]
    public async Task SendMessage() {
        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{Channel.Id}/messages", new JsonObject() {
            { "content", "meow" }
        }, cancellationToken: TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task SendMessageMultipart() {
        var content = new MultipartFormDataContent();
        content.Add(JsonContent.Create(new JsonObject() {
            { "content", "meow" }
        }), "payload_json");
        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync($"channels/{Channel.Id}/messages", content, cancellationToken: TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task SendFileMessageMultipart() {
        var content = new MultipartFormDataContent();
        content.Add(JsonContent.Create(new JsonObject() {
            { "content", "meow" },
            // BUG: https://docs.discord.food/reference#uploading-files - attachments should be allowed
            // {
            // "attachments", new JsonArray() {
            // new JsonObject() {
            // { "id", 0 },
            // { "filename", "hellorld.txt" }
            // }
            // }
            // }
        }), "payload_json");
        content.Add(
            new ByteArrayContent("Hellorld!"u8.ToArray()) {
                Headers = {
                    ContentType = new MediaTypeHeaderValue("text/plain", "utf-8"),
                    ContentDisposition = new ContentDispositionHeaderValue("form-data") {
                        Name = "files[0]",
                        FileName = "hellorld.txt"
                    }
                }
            }
        );

        testOutputHelper.WriteLine(await content.ReadAsStringAsync());

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync($"channels/{Channel.Id}/messages", content,
            cancellationToken: TestContext.Current.CancellationToken));
        var json = (await res.Content.ReadFromJsonAsync<JsonObject>());
        testOutputHelper.WriteLine(json.ToJson(indent: true));
        var msg = json.Deserialize<Message>();
        Assert.Equal("meow", msg.Content);
    }

    [Fact]
    public async Task SendFileMessageCloud() {
        var createAttResp = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{Channel.Id}/attachments", new CreateAttachmentRequest() {
            Files = [
                new() {
                    Id = 0,
                    FileName = "hellorld.txt",
                    FileSize = "Hellorld!".Length
                }
            ]
        }, cancellationToken: TestContext.Current.CancellationToken));
        var createAttRespContent = await createAttResp.Content.ReadFromJsonAsync<JsonObject>();
        testOutputHelper.WriteLine(createAttRespContent.ToString());

        var createAtt = createAttRespContent.Deserialize<CreateAttachmentResponse>();
        foreach (var attFile in createAtt.Attachments) {
            var ret = await Assert.HttpSuccess(await Client.ApiHttpClient.PutAsync(attFile.UploadUrl,
                new ByteArrayContent("Hellorld!"u8.ToArray()) {
                    Headers = {
                        ContentType = new MediaTypeHeaderValue("text/plain")
                    }
                }));
            var retCon = await ret.Content.ReadFromJsonAsync<JsonObject>();
            testOutputHelper.WriteLine(retCon.ToString());
        }

        // var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync($"channels/{Channel.Id}/messages", content,
        // cancellationToken: TestContext.Current.CancellationToken));
        // var json = (await res.Content.ReadFromJsonAsync<JsonObject>());
        // testOutputHelper.WriteLine(json.ToJson(indent: true));
        // var msg = json.Deserialize<Message>();
        // Assert.Equal("meow", msg.Content);
    }

    public static IEnumerable<object?[]> WebhookExecuteCombinations() {
        string[] contents = ["meow", "meowmeow", "emma was here", "# hi!!!", "https://spacebar.chat/favicon.ico", "@everyone", "@here"];
        string?[] usernames = [null, "meow"];
        string?[] avatarUrls = [null, "https://spacebar.chat/favicon.ico"];
        bool?[] ttsEnabled = [null, true, false];
        int?[] messageFlags = [
            null,
            0,       // default
            1 << 2,  // SUPPRESS_EMBEDS
            1 << 12, // SUPPRESS_NOTIFICATIONS
            1 << 13  // VOICE_MESSAGE
        ];

        foreach (var content in contents)
            // foreach (var avatarUrl in avatarUrls)
            foreach (var tts in ttsEnabled)
                foreach (var flags in messageFlags)
                    foreach (var withNonce in (bool[])[true, false])
                        yield return [content, null /*avatarUrl*/, tts, flags, withNonce ? Guid.NewGuid().ToString() : null];
    }

    [Theory]
    [MemberData(nameof(WebhookExecuteCombinations))]
    public async Task SendWebhookMessageWithData(string content, string? avatarUrl, bool? tts, int? flags, string? nonce) {
        var payload = new JsonObject() {
            { "content", content }
        };
        if (avatarUrl != null) payload.Add("avatar_url", avatarUrl);
        if (tts != null) payload.Add("tts", tts);
        if (flags != null) payload.Add("flags", flags);
        if (nonce != null) payload.Add("nonce", nonce);

        var reqContent = new MultipartFormDataContent();
        reqContent.Add(JsonContent.Create(payload), "payload_json");
        testOutputHelper.WriteLine(await reqContent.ReadAsStringAsync());

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync($"channels/{Channel.Id}/messages", reqContent,
            cancellationToken: TestContext.Current.CancellationToken));
        var json = (await res.Content.ReadFromJsonAsync<JsonObject>());
        testOutputHelper.WriteLine(json.ToJson(indent: true));
        var msg = json.Deserialize<Message>();
        Assert.Equal(content, msg.Content);
    }
}