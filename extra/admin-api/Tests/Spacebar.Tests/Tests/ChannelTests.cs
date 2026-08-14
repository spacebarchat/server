using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.Models.Api;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class ChannelTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;
    private static Guild? Guild { get; set; }
    private static Channel? Channel { get; set; }

    public async ValueTask InitializeAsync() {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
        // ...and a guild
        Guild ??= await Client.CreateGuild(new() {
            Name = "Test guild"
        });
        Channel ??= await Client.GetGuild(Guild.Id).CreateChannelAsync(new() { Name = "meow", Type = 0 });
    }

    [Fact]
    public async Task CreateChannel() {
        Assert.Equal("Test guild", Guild!.Name);
        var channel = await Client!.GetGuild(Guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0 // TODO: this should be the default
        });

        Assert.Equal("test", channel.Name);
    }

    [Fact]
    public async Task GetChannel() {
        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync("channels/" + Channel.Id, TestContext.Current.CancellationToken));

        var channelResp = await res.Content.ReadFromJsonAsync<Channel>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(Channel.Name, channelResp!.Name);
        Assert.Equal(Channel.Id, channelResp!.Id);
    }

    [Fact]
    public async Task SendTyping() {
        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsync($"channels/{Channel!.Id}/typing", null, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task UpdateChannel() {
        var cg = Client.GetGuild(Guild.Id);
        var nc = await cg.CreateChannelAsync(new() {
            Name = "asdf",
            Type = 0
        });
        
        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PatchAsJsonAsync($"channels/{nc.Id}", new JsonObject() {
            { "name", "hellorld" }
        }, cancellationToken: TestContext.Current.CancellationToken));
        
        var resC = await res.Content.ReadFromJsonAsync<Channel>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal("hellorld", resC!.Name);
        
        var c = await Client.GetChannel(nc.Id).GetInfoAsync();
        Assert.Equal("hellorld", c.Name);
    }    
    
    [Fact]
    public async Task DeleteChannel() {
        var cg = Client.GetGuild(Guild.Id);
        var c = await cg.CreateChannelAsync(new() {
            Name = "asdf",
            Type = 0
        });

        await Assert.HttpSuccess(await Client.ApiHttpClient.DeleteAsync($"channels/{c.Id}", TestContext.Current.CancellationToken));
    }
    
    [Fact]
    public async Task GetAttachmentList() {
        var channel = await Client!.GetGuild(Guild.Id).CreateChannelAsync(new() {
            Name = "test",
            Type = 0 // TODO: this should be the default
        });

        Assert.Equal("test", channel.Name);
        
        var createAttResp = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{channel.Id}/attachments", new CreateAttachmentRequest() {
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
        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{channel.Id}/messages", content,
            cancellationToken: TestContext.Current.CancellationToken));
        var json = (await res.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: TestContext.Current.CancellationToken));
        // testOutputHelper.WriteLine(json.ToJson(indent: true));
        var msg = json.Deserialize<Message>();
        Assert.Equal("meow", msg.Content);
        Assert.Single(msg.Attachments);

        var attListResp = await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync($"/_spacebar/api/v1/channels/{channel.Id}/attachments", TestContext.Current.CancellationToken));
        var attListJson = await attListResp.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: TestContext.Current.CancellationToken);
        var attList = attListJson.Deserialize<AttachmentListResponse>()!;
        Assert.Equal(1, attList.Total);
        Assert.All(attList.Items, e => {
            Assert.Equal(channel.Id, e.MessageReference.ChannelId);
            Assert.Equal(msg.Id, e.MessageReference.MessageId);
            Assert.Equal(Guild.Id, e.MessageReference.GuildId);

            Assert.StringNotNullOrWhitespace(e.Attachment.ContentType);
            Assert.StringNotNullOrWhitespace(e.Attachment.Filename);
            Assert.StringNotNullOrWhitespace(e.Attachment.ProxyUrl);
            Assert.StringNotNullOrWhitespace(e.Attachment.Url);
            Assert.NotEqual(0, e.Attachment.Size);
            Assert.Null(e.Attachment.Width);
            Assert.Null(e.Attachment.Height);
        });
    }
}