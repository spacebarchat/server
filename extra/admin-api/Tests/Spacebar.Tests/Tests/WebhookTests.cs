using System.Net.Http.Headers;
using System.Net.Http.Json;
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

public class WebhookTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client = null!;
    private static SpacebarClientGuild? Guild;

    private static SpacebarClientChannel? Channel = null!;
    private static Webhook? Webhook = null!;
    private static Message? WebhookMessage = null!;

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

        if (Webhook is null)
            await Channel!.CreateWebhookAsync(new() {
                Name = "meow"
            }).ContinueWith(w => {
                Assert.Equal("meow", w.Result.Name);
                Assert.StringNotNullOrWhitespace(w.Result.Url);
                Webhook = w.Result;
            });

        if (WebhookMessage is null)
            WebhookMessage = await (await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", new JsonObject() {
                { "content", "meow" }
            })).Content.ReadFromJsonAsync<Message>();
    }

    [Fact]
    public async Task CreateWebhook() {
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
    }

    [Fact]
    public async Task DeleteWebhookByToken() {
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
        await Assert.HttpSuccess(await Client.ApiHttpClient.DeleteAsync(wh.Url, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task DeleteWebhook() {
        var wh = await Channel!.CreateWebhookAsync(new() {
            Name = "meow"
        });

        Assert.Equal("meow", wh.Name);
        Assert.StringNotNullOrWhitespace(wh.Url);
        await Assert.HttpSuccess(await Client.ApiHttpClient.DeleteAsync($"webhooks/{wh.Id}", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task CreateMultipleWebhooks() {
        var channel = await Guild!.CreateChannelAsync(new() {
            Name = "test",
            Type = 0
        });

        Assert.Equal("test", channel.Name);

        var cChannel = Client.GetChannel(channel.Id);

        var count = Random.Shared.Next(10);
        testOutputHelper.WriteLine($"Creating {count} webhooks...");
        await Task.WhenAll(Enumerable.Range(0, count).Select(i => cChannel.CreateWebhookAsync(new() {
            Name = "meow" + i
        })).ToList());

        var wh = await cChannel.GetWebhooksAsync();
        Assert.All(wh, h => Assert.StartsWith("meow", h.Name));
        Assert.All(wh, h => Assert.StringNotNullOrWhitespace(h.Url));
    }

    [Fact]
    public async Task SendWebhookMessage() {
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url, new JsonObject() {
            { "content", "meow" }
        });
    }

    [Fact]
    public async Task SendWebhookMessageWithWait() {
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", new JsonObject() {
            { "content", "meow" }
        });
    }

    public static IEnumerable<object?[]> WebhookExecuteCombinations() {
        string[] contents = ["meow", "# hi!!!", Client.ClientWellKnown.Api.BaseUrl, "@everyone", "@here"];
        string?[] usernames = [null, "meow"];
        string?[] avatarUrls = [null, Client.ClientWellKnown.Api.BaseUrl + "/static/logo.png"];
        bool?[] ttsEnabled = [null, true, false];
        int?[] messageFlags = [
            null,
            0,       // default
            1 << 2,  // SUPPRESS_EMBEDS
            1 << 12, // SUPPRESS_NOTIFICATIONS
            1 << 13  // VOICE_MESSAGE
        ];

        foreach (var content in contents)
            foreach (var username in usernames)
                foreach (var avatarUrl in avatarUrls)
                    foreach (var tts in ttsEnabled)
                        foreach (var flags in messageFlags)
                            yield return [content, username, avatarUrl, tts, flags];
    }

    [Theory]
    [MemberData(nameof(WebhookExecuteCombinations))]
    public async Task SendWebhookMessageWithData(string content, string? username, string? avatarUrl, bool? tts, int? flags) {
        var payload = new JsonObject() {
            { "content", content }
        };
        if (username != null) payload.Add("username", username);
        if (avatarUrl != null) payload.Add("avatar_url", avatarUrl);
        if (tts != null) payload.Add("tts", tts);
        if (flags != null) payload.Add("flags", flags);

        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", payload);
    }

    [Fact]
    public async Task SendWebhookMessageWithAvatarUrl() {
        await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", new JsonObject() {
            { "content", "meow" },
            { "avatar_url", Client.ClientWellKnown.Api.BaseUrl + "/static/logo.png" }
        });
    }

    [Fact]
    public async Task GetWebhookMessageById() {
        var msg = await Assert.SuccessfullyHttpGetAsync(Webhook.Url + "/messages/" + WebhookMessage.Id);
    }

    [Fact]
    public async Task DeleteWebhookMessageById() {
        var msg = await Assert.SuccessfullyHttpPostAsJsonAsync(Webhook.Url + "?wait=true", new JsonObject() {
            { "content", "meow" },
        });
        var actualMsg = await msg.Content.ReadFromJsonAsync<Message>();
        await Assert.SuccessfullyHttpDeleteAsync(Webhook.Url + "/messages/" + actualMsg!.Id);
    }

    [Theory]
    [MemberData(nameof(WebhookExecuteCombinations))]
    public async Task EditWebhookMessageByIdWithData(string content, string? username, string? avatarUrl, bool? tts, int? flags) {
        var payload = new JsonObject() {
            { "content", content }
        };
        if (username != null) payload.Add("username", username);
        if (avatarUrl != null) payload.Add("avatar_url", avatarUrl);
        if (tts != null) payload.Add("tts", tts);
        if (flags != null) payload.Add("flags", flags);

        await Assert.SuccessfullyHttpPatchAsJsonAsync(Webhook.Url + "/messages/" + WebhookMessage!.Id + "?wait=true", payload);
    }

    [Fact]
    public async Task SendWebhookMessageMultipart() {
        var content = new MultipartFormDataContent();
        content.Add(JsonContent.Create(new JsonObject() {
            { "content", "meow" }
        }), "payload_json");
        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync(Webhook.Url + "?wait=true", content, cancellationToken: TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task SendWebhookFileMessageMultipart() {
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

        // testOutputHelper.WriteLine(await content.ReadAsStringAsync());

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync(Webhook.Url + "?wait=true", content,
            cancellationToken: TestContext.Current.CancellationToken));
        var json = (await res.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: TestContext.Current.CancellationToken));
        // testOutputHelper.WriteLine(json.ToJson(indent: true));
        var msg = json.Deserialize<Message>();
        Assert.Equal("meow", msg.Content);
    }

    [Fact]
    public async Task SendWebhookFileMessageCloud() {
        var createAttResp = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{Channel.Id}/attachments", new CreateAttachmentRequest() {
            Files = [
                new() {
                    Id = 0,
                    FileName = "hellorld.txt",
                    FileSize = "Hellorld!".Length
                }
            ]
        }, cancellationToken: TestContext.Current.CancellationToken));
        var createAttRespContent = await createAttResp.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: TestContext.Current.CancellationToken);
        // testOutputHelper.WriteLine(createAttRespContent?.ToString());

        var createAtt = createAttRespContent.Deserialize<CreateAttachmentResponse>();
        foreach (var attFile in createAtt.Attachments)
            await Assert.HttpSuccess(await Client.ApiHttpClient.PutAsync(attFile.UploadUrl, new ByteArrayContent("Hellorld!"u8.ToArray()) {
                Headers = {
                    ContentType = new MediaTypeHeaderValue("text/plain")
                }
            }, TestContext.Current.CancellationToken));

        var content = new JsonObject() {
            { "content", "meow" }, {
                "attachments", new JsonArray() {
                    new JsonObject() {
                        { "id", createAtt.Attachments[0].Id.ToString() },
                        { "filename", "hellorld.txt" },
                        { "uploaded_filename", createAtt.Attachments[0].UploadFileName },
                        { "original_content_type", "text/plain" },
                    }
                }
            }
        };
        testOutputHelper.WriteLine(content.ToJson(indent: true));
        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync(Webhook.Url + "?wait=true", content,
            cancellationToken: TestContext.Current.CancellationToken));
        var json = (await res.Content.ReadFromJsonAsync<JsonObject>());
        testOutputHelper.WriteLine(json.ToJson(indent: true));
        var msg = json.Deserialize<Message>();
        Assert.Equal("meow", msg.Content);
        Assert.Single(msg.Attachments);
    }
}